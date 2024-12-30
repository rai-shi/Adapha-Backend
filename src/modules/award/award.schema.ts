import * as z from "zod";
import "zod-openapi/extend";

export const awardTranslationSchema = z.object({
  language: z
    .string({
      required_error: "Language is required",
      invalid_type_error: "Language must be a string",
    })
    .min(2, { message: "Language code must be at least 2 characters" }),
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .min(1, { message: "Title cannot be empty" }),
  description: z
    .string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string",
    })
    .min(1, { message: "Description cannot be empty" }),
});

export const awardSchema = z.object({
  image: z
    .string({
      required_error: "Image is required",
      invalid_type_error: "Image must be a string",
    })
    .url({ message: "Image must be a valid URL" }),
  translations: z
    .array(awardTranslationSchema)
    .nonempty({ message: "At least one translation is required" }),
});

export const awardResponseSchema = z
  .object({
    id: z.number().describe("The award ID"),
  })
  .merge(awardSchema)
  .openapi({
    description: "Award Response Schema",
  });

export const awardsResponseSchema = z
  .object({
    totalCount: z.number().describe("Total number of awards"),
    data: awardResponseSchema.array().describe("List of awards"),
  })
  .openapi({
    description: "Awards Response Schema",
  });

export const paramsSchema = z.object({
  id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "ID must be a valid number",
    })
    .openapi({
      description: "The award ID",
    }),
});

export type AwardInput = z.infer<typeof awardSchema>;
export type AwardResponse = z.infer<typeof awardResponseSchema>;
