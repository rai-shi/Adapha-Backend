import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  changePasswordHandler,
  deleteUserHandler,
  getUserHandler,
  getUsersHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerUserHandler,
} from "./user.controller";
import {
  createUserResponseSchema,
  createUserSchema,
  loginResponseSchema,
  loginSchema,
} from "./user.schema";

async function userRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/register",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["User"],
        body: createUserSchema,
        response: {
          201: createUserResponseSchema,
        },
      },
    },
    registerUserHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/login",
    {
      schema: {
        tags: ["User"],
        body: loginSchema,
        response: {
          201: loginResponseSchema,
        },
      },
    },
    loginHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["User"],
      },
    },
    getUsersHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/logout",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["User"],
      },
    },
    logoutHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/me",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["User"],
      },
    },
    getUserHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/refresh",
    {
      schema: {
        tags: ["User"],
      },
    },
    refreshTokenHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/change-password",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["User"],
      },
    },
    changePasswordHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/:id",
    {
      schema: {
        preHandler: [server.authenticate],
        tags: ["User"],
      },
    },
    deleteUserHandler
  );
}

export default userRoutes;
