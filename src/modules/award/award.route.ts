// AWARD ROUTES

import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import {
  createAwardHandler,
  deleteAwardHandler,
  getAwardByIdHandler,
  getAwardsByLanguageHandler,
  getAwardsHandler,
  updateAwardHandler,
} from "./award.controller";
import {
  AwardParamsSchema,
  awardQuerySchema,
  awardQuerySchemaByLanguage,
  AwardResponseSchema,
  AwardsByLanguageSchema,
  AwardSchema,
  AwardsResponseSchema,
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
        querystring: awardQuerySchema,
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
}

export async function turkishAwardRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Award"],
        response: {
          200: AwardsByLanguageSchema,
        },
        querystring: awardQuerySchemaByLanguage,
      },
    },
    async (
      request: FastifyRequest<{
        Params: { language: "en" | "tr" };
        Querystring: PaginationOptions & SortingOptions & FilterOptions;
      }>,
      reply
    ) => {
      const req = { ...request, params: { language: "tr" as "en" | "tr" } };
      return getAwardsByLanguageHandler(req, reply);
    }
  );
}

export async function englishAwardRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Award"],
        response: {
          200: AwardsByLanguageSchema,
        },
        querystring: awardQuerySchemaByLanguage,
      },
    },
    async (
      request: FastifyRequest<{
        Params: { language: "en" | "tr" };
        Querystring: PaginationOptions & SortingOptions & FilterOptions;
      }>,
      reply
    ) => {
      const req = { ...request, params: { language: "en" as "en" | "tr" } };
      return getAwardsByLanguageHandler(req, reply);
    }
  );
}
