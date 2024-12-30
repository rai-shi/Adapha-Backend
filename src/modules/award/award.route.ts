import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  createAwardHandler,
  deleteAwardHandler,
  getAwardByIdHandler,
  getAwardsHandler,
} from "./award.controller";
import {
  awardResponseSchema,
  awardSchema,
  awardsResponseSchema,
  paramsSchema,
} from "./award.schema";

export default async function awardRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Award"],
        response: {
          200: awardsResponseSchema,
        },
      },
    },
    getAwardsHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Award"],
        params: paramsSchema,
        response: {
          200: awardResponseSchema,
        },
      },
    },
    getAwardByIdHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/create",
    {
      schema: {
        tags: ["Award"],
        body: awardSchema,
        response: {
          201: awardResponseSchema,
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
        params: paramsSchema,
      },
    },
    deleteAwardHandler
  );
}
