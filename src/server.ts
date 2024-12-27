import fCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransform,
  fastifyZodOpenApiTransformObject,
  serializerCompiler,
  validatorCompiler,
} from "fastify-zod-openapi";
import { ZodOpenApiVersion } from "zod-openapi";
import "zod-openapi/extend";
import contactRoutes from "./modules/contact/contact.route";
import {
  englishNewCategoryRoutes,
  newCategoryRoutes,
  turkishNewCategoryRoutes,
} from "./modules/new-category/new-category.route";
import {
  englishNewRoutes,
  newRoutes,
  turkishNewRoutes,
} from "./modules/new/new.route";
import uploadRoutes from "./modules/upload/upload.route";
import userRoutes from "./modules/user/user.route";
import { 
  turkishTeamRoutes, 
  englishTeamRoutes, 
  teamRoutes } from "./modules/team/team.route";

export function buildServer() {
  const server = Fastify({});

  server.register(cors, {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  const onFile = async (part: any) => {
    if (part.filename === "") return;

    if (part.fields[part.fieldname].length !== undefined)
      part.value = {
        filename: part.filename,
        mimetype: part.mimetype,
        encoding: part.encoding,
        value: await part.toBuffer(),
      };
    else
      part.value = [
        {
          filename: part.filename,
          mimetype: part.mimetype,
          encoding: part.encoding,
          value: await part.toBuffer(),
        },
      ];
  };

  server.register(fastifyMultipart, {
    attachFieldsToBody: "keyValues",
    onFile,
    limits: {
      fileSize: 4 * 1024 * 1024,
    },
  });

  server.register(fastifyZodOpenApiPlugin);
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.register(fjwt, {
    secret: process.env.JWT_SECRET || "some-secret-key",
  });

  server.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const accessToken = request.headers.authorization?.split(" ")[1];
      const refreshToken = request.cookies.refresh_token;

      // Eğer access token ve refresh token yoksa 401 döndür
      if (!accessToken && !refreshToken) {
        return reply.status(401).send({ message: "Authentication required." });
      }

      // Eğer access token yoksa ve refresh token varsa 403 döndür
      if (!accessToken) {
        return reply.status(401).send({
          message: "Access token is missing but refresh token is present.",
        });
      }

      // Burada access token geçerli mi diye kontrol ediyoruz
      try {
        const decoded = request.jwt.verify(accessToken);
        request.user = decoded;
      } catch (error) {
        // Access token süresi bittiyse
        if ((error as any).code === "FAST_JWT_EXPIRED") {
          // Refresh token yoksa 401 döndür
          if (!refreshToken) {
            return reply
              .status(401)
              .send({ message: "Unauthorized, no refresh token found." });
          }

          try {
            // Refresh token geçerliliğini kontrol et
            request.jwt.verify(refreshToken);
            // Refresh token geçerli ise 403 hatası döndür
            return reply.status(401).send({
              message: "Access token expired, please refresh.",
            });
          } catch (refreshError) {
            // Refresh token süresi dolmuşsa çıkış işlemi yap ve 401 döndür
            reply.clearCookie("refresh_token");
            return reply.status(401).send({
              message: "Unauthorized, session expired.",
            });
          }
        }

        // Access token geçersiz
        return reply
          .status(401)
          .send({ message: "Unauthorized, token invalid." });
      }
    }
  );

  server.addHook("preHandler", (req, res, next) => {
    req.jwt = server.jwt;
    return next();
  });

  server.register(fCookie, {
    secret: process.env.COOKIE_SECRET,
    hook: "preHandler",
  });

  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Adapha API",
        description: "API documentation for Adapha",
        version: "1.0.0",
        contact: {
          name: "Api Support",
          email: "emirsahinkaratas@gmail.com",
        },
      },
      openapi: "3.0.3" satisfies ZodOpenApiVersion,
      servers: [],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "access_token",
            description: "JWT auth using cookies",
          },
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT auth using the Authorization header",
          },
        },
      },
      security: [{ cookieAuth: [], bearerAuth: [] }],
    },
    transform: fastifyZodOpenApiTransform,
    transformObject: fastifyZodOpenApiTransformObject,
  });

  server.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
  });

  server.register(uploadRoutes, { prefix: "api/uploads" });
  server.register(userRoutes, { prefix: "api/users" });
  server.register(contactRoutes, { prefix: "api/contacts" });

  server.register(newCategoryRoutes, { prefix: "api/new-categories" });
  server.register(englishNewCategoryRoutes, {
    prefix: "api/en/new-categories",
  });
  server.register(turkishNewCategoryRoutes, {
    prefix: "api/tr/new-categories",
  });

  server.register(newRoutes, { prefix: "api/news" });
  server.register(englishNewRoutes, { prefix: "api/en/news" });
  server.register(turkishNewRoutes, { prefix: "api/tr/news" });

  server.register(teamRoutes, { prefix: "api/team" });
  server.register(englishTeamRoutes, { prefix: "api/en/team" });
  server.register(turkishTeamRoutes, { prefix: "api/tr/team" });

  return server;
}
