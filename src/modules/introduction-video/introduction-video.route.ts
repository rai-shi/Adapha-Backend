import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
    createIntroductionVideoHandler,
    deleteIntroductionVideoHandler,
    getIntroductionVideoByIdHandler,
    getIntroductionVideosByLanguageHandler,
    getIntroductionVideosHandler,
    updateIntroductionVideoHandler,
} from "./introduction-video.controller";
import {
    editIntroductionVideoSchema,
    getIntroductionVideosByLanguageResponseSchema,
    introductionVideoQueryStringSchema,
    IntroductionVideoResponseSchema,
    IntroductionVideoSchema,
    IntroductionVideosResponseSchema,
} from "./introduction-video.schema";

export default async function introductionVideoRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Introduction Video"],
        response: {
          200: IntroductionVideosResponseSchema,
        },
        querystring: introductionVideoQueryStringSchema,
      },
    },
    getIntroductionVideosHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["Introduction Video"],
        response: {
          200: IntroductionVideoResponseSchema,
        },
      },
    },
    getIntroductionVideoByIdHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/create",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Introduction Video"],
        body: IntroductionVideoSchema,
        response: {
          201: IntroductionVideoResponseSchema,
        },
      },
    },
    createIntroductionVideoHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().put(
    "/:id",
    {
      schema: {
        preHandler: [server.authenticate],
        tags: ["Introduction Video"],
        body: editIntroductionVideoSchema,
        response: {
          201: IntroductionVideoResponseSchema,
        },
      },
    },
    updateIntroductionVideoHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Introduction Video"],
      },
    },
    deleteIntroductionVideoHandler
  );
}

export async function englishIntroductionVideoRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Introduction Video"],
        response: {
          200: getIntroductionVideosByLanguageResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { language: "en" | "tr" };
      }>,
      reply
    ) => {
      const req = { ...request, params: { language: "en" as "en" | "tr" } };
      return getIntroductionVideosByLanguageHandler(req, reply);
    }
  );
}

export async function turkishIntroductionVideoRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Introduction Video"],
        response: {
          200: getIntroductionVideosByLanguageResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { language: "en" | "tr" };
      }>,
      reply
    ) => {
      const req = { ...request, params: { language: "tr" as "en" | "tr" } };
      return getIntroductionVideosByLanguageHandler(req, reply);
    }
  );
}
