import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  createNewCategoryHandler,
  deleteNewCategoryHandler,
  getAllNewCategoriesHandler,
  getNewCategoriesByIdAndLanguageHandler,
  getNewCategoriesByLanguageHandler,
  getNewCategoryByIdHandler,
  updateNewCategoryHandler,
} from "./new-category.controller";
import {
  createNewCategoryResponseSchema,
  createNewCategorySchema,
  editNewCategorySchema,
  getAllNewCategoriesResponseSchema,
  getNewCategoriesByLanguageResponseSchema,
  getNewCategoryByIdAndLanguageResponseSchema,
  getNewCategoryByIdResponseSchema,
} from "./new-category.schema";

export async function newCategoryRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["New Category"],
        response: {
          200: getAllNewCategoriesResponseSchema,
        },
      },
    },
    getAllNewCategoriesHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["New Category"],
        response: {
          200: getNewCategoryByIdResponseSchema,
        },
      },
    },
    getNewCategoryByIdHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/create",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["New Category"],
        body: createNewCategorySchema,
        response: {
          201: createNewCategoryResponseSchema,
        },
      },
    },
    createNewCategoryHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/:id",
    {
      schema: {
        preHandler: [server.authenticate],
        tags: ["New Category"],
      },
    },
    deleteNewCategoryHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().put(
    "/:id",
    {
      schema: {
        preHandler: [server.authenticate],
        tags: ["New Category"],
        body: editNewCategorySchema,
        response: {
          201: createNewCategoryResponseSchema,
        },
      },
    },
    updateNewCategoryHandler
  );
}

export async function englishNewCategoryRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["New Category"],
        response: {
          200: getNewCategoriesByLanguageResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const req = { ...request, params: { language: "en" as "en" | "tr" } };
      return getNewCategoriesByLanguageHandler(req, reply);
    }
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["New Category"],
        response: {
          200: getNewCategoryByIdAndLanguageResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string; language: "en" | "tr" };
      }>,
      reply
    ) => {
      const req = {
        ...request,
        params: { ...request.params, language: "en" as "en" | "tr" },
      };
      return getNewCategoriesByIdAndLanguageHandler(req, reply);
    }
  );
}

export async function turkishNewCategoryRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["New Category"],
        response: {
          200: getNewCategoriesByLanguageResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const req = { ...request, params: { language: "tr" as "en" | "tr" } };
      return getNewCategoriesByLanguageHandler(req, reply);
    }
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["New Category"],
        response: {
          200: getNewCategoryByIdAndLanguageResponseSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string; language: "en" | "tr" };
      }>,
      reply
    ) => {
      const req = {
        ...request,
        params: { ...request.params, language: "tr" as "en" | "tr" },
      };
      return getNewCategoriesByIdAndLanguageHandler(req, reply);
    }
  );
}
