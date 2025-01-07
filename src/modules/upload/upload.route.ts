import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import * as z from "zod";
import { postImageHandler, postVideoHandler } from "./upload.controller";

export default async function uploadRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/createImage",
    {
      preHandler: [server.authenticate],
      schema: {
        consumes: ["multipart/form-data"],
        tags: ["Upload"],
        body: z.object({
          images: z
            .custom()
            .array()
            .openapi({
              type: "array",
              items: {
                type: "string",
                description: "The image",
                format: "binary",
              },
              description: "Array of images",
            }),
        }),
      },
    },
    postImageHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/createVideo",
    {
      schema: {
        consumes: ["multipart/form-data"],
        tags: ["Upload"],
        body: z.object({
          videos: z
            .custom()
            .array()
            .openapi({
              type: "array",
              items: {
                type: "string",
                description: "The video",
                format: "binary",
              },
              description: "Array of videos",
            }),
        }),
      },
    },
    postVideoHandler
  );
}
