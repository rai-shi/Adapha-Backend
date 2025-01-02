import { z } from "zod";

export const queryStringBaseSchema = z.object({
  page: z.string().optional().openapi({
    description: "The page number",
  }),
  limit: z.string().optional().openapi({
    description: "The number of items per page",
  }),
  sortBy: z.string().optional().openapi({
    description: "Sort by query",
  }),
  order: z.string().optional().openapi({
    description: "Order query",
  }),
});
