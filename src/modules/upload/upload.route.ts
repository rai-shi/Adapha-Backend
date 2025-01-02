import { FastifyInstance } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import * as z from "zod";
import { getImageHandler, postImageHandler } from "./upload.controller";

export default async function uploadRoutes(server: FastifyInstance) {
  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
    "/:filename",
    {
      schema: {
        tags: ["Upload"],
      },
    },
    getImageHandler
  );

  server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
    "/createImage",
    {
      // preHandler: [server.authenticate],
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
                description: "The image URL",
                format: "binary",
              },
              description: "Array of image URLs",
            }),
        }),
      },
    },
    postImageHandler
  );
}
