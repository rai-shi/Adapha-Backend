// AWARD ROUTES

import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  createAwardHandler,
  deleteAwardHandler,
  getAwardByIdHandler,
  getAwardsHandler,
  getAwardByIdAndLanguageHandler,
  getAwardsByLanguageHandler,
  updateAwardHandler,
} from "./award.controller";
import {
  AwardParamsSchema,
  AwardResponseSchema,
  AwardsResponseSchema,
  AwardSchema,
  EditAwardSchema,
} from "./award.schema";

export default async function awardRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Award"],
        response: {
          200: AwardsResponseSchema,
        },
      },
    },
    getAwardsHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["Award"],
        params: AwardParamsSchema,
        response: {
          200: AwardResponseSchema,
        },
      },
    },
    getAwardByIdHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/create",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Award"],
        body: AwardSchema,
        response: {
          201: AwardResponseSchema,
        },
      },
    },
    createAwardHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Award"],
        params: AwardParamsSchema,
      },
    },
    deleteAwardHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().put(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Award"],
        params: AwardParamsSchema,
        body: EditAwardSchema,
        response: {
          201: AwardResponseSchema,
        },
      },
    },
    updateAwardHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/language/:language",
    {
      schema: {
        tags: ["Award"],
        response: {
          200: AwardsResponseSchema,
        },
      },
    },
    getAwardsByLanguageHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id/language/:language",
    {
      schema: {
        tags: ["Award"],
        response: {
          200: AwardResponseSchema,
        },
      },
    },
    getAwardByIdAndLanguageHandler
  );
}
