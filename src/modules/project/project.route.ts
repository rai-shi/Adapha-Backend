// Project ROUTES

import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectByIdHandler,
  getProjectsByLanguageHandler,
  getProjectsHandler,
  updateProjectHandler,
} from "./project.controller";
import {
  ProjectParamsSchema,
  ProjectResponseSchema,
  ProjectsByLanguageSchema,
  ProjectSchema,
  ProjectsResponseSchema,
  EditProjectSchema,
} from "./project.schema";

export default async function projectRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Project"],
        response: {
          200: ProjectsResponseSchema,
        },
      },
    },
    getProjectsHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["Project"],
        params: ProjectParamsSchema,
        response: {
          200: ProjectResponseSchema,
        },
      },
    },
    getProjectByIdHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/create",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Project"],
        body: ProjectSchema,
        response: {
          201: ProjectResponseSchema,
        },
      },
    },
    createProjectHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Project"],
        params: ProjectParamsSchema,
      },
    },
    deleteProjectHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().put(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Project"],
        params: ProjectParamsSchema,
        body: EditProjectSchema,
        response: {
          201: ProjectResponseSchema,
        },
      },
    },
    updateProjectHandler
  );
}

export async function turkishProjectRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Project"],
        response: {
          200: ProjectsByLanguageSchema,
        },
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
      return getProjectsByLanguageHandler(req, reply);
    }
  );
}

export async function englishProjectRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["Project"],
        response: {
          200: ProjectsByLanguageSchema,
        },
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
      return getProjectsByLanguageHandler(req, reply);
    }
  );
}
