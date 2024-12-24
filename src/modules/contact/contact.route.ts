import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
  createContactHandler,
  deleteContactHandler,
  getContactByIdHandler,
  getContactsHandler,
} from "./contact.controller";
import {
  contactResponseSchema,
  contactSchema,
  contactsResponseSchema,
  paramsSchema,
} from "./contact.schema";

export default async function contactRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Contact"],
        response: {
          200: contactsResponseSchema,
        },
      },
    },
    getContactsHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Contact"],
        params: paramsSchema,
        response: {
          200: contactResponseSchema,
        },
      },
    },
    getContactByIdHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/create",
    {
      schema: {
        tags: ["Contact"],
        body: contactSchema,
        response: {
          201: contactResponseSchema,
        },
      },
    },
    createContactHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["Contact"],
        params: paramsSchema,
      },
    },
    deleteContactHandler
  );
}
