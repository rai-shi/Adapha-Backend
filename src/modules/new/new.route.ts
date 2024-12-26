import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import {
  createNewHandler,
  deleteNewHandler,
  getAllNewsHandler,
  getNewByIdAndLanguageHandler,
  getNewByIdHandler,
  getNewByLanguageHandler,
} from "./new.controller";
import {
  createNewResponseSchema,
  createNewSchema,
  getAllNewsResponseSchema,
  getNewByLanguageResponseSchema,
  getNewsByIdResponseSchema,
  getNewsByLanguageSchema,
} from "./new.schema";

export async function newRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["New"],
        response: {
          200: getAllNewsResponseSchema,
        },
      },
    },
    getAllNewsHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["New"],
        response: {
          200: getNewsByIdResponseSchema,
        },
      },
    },
    getNewByIdHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/create",
    {
      //   preHandler: [server.authenticate],
      schema: {
        tags: ["New"],
        body: createNewSchema,
        response: {
          201: createNewResponseSchema,
        },
      },
    },
    createNewHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/:id",
    {
      //   preHandler: [server.authenticate],
      schema: {
        tags: ["New"],
        response: {
          // 204: createNewResponseSchema,
        },
      },
    },
    deleteNewHandler
  );
}

export async function englishNewRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["New"],
        response: {
          200: getNewsByLanguageSchema,
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
      return getNewByLanguageHandler(req, reply);
    }
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["New"],
        response: {
          200: getNewByLanguageResponseSchema,
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
      return getNewByIdAndLanguageHandler(req, reply);
    }
  );
}

export async function turkishNewRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      schema: {
        tags: ["New"],
        response: {
          200: getNewsByLanguageSchema,
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
      return getNewByLanguageHandler(req, reply);
    }
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      schema: {
        tags: ["New"],
        response: {
          200: getNewByLanguageResponseSchema,
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
      return getNewByIdAndLanguageHandler(req, reply);
    }
  );
}
