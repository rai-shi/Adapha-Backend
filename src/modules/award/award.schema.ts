// AWARD SCHEMA

import * as z from "zod";
import "zod-openapi/extend";

export const AwardTranslationSchema = z.object({
  language: z
    .enum(["en", "tr"])
    .refine((value) => ["en", "tr"].includes(value), {
      message: "Language must be one of 'en' or 'tr'",
    }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export const AwardSchema = z.object({
  image: z.string().min(1, "Image is required"),
  translations: z
    .array(AwardTranslationSchema)
    .refine(
      (translations) => {
        const languages = translations.map((t) => t.language);
        return languages.includes("en") && languages.includes("tr");
      },
      {
        message: "Both 'tr' and 'en' translations are required",
      }
    )
    .openapi({
      example: [
        {
          language: "tr",
          title: "Türkçe Başlık",
          description: "Türkçe Açıklama",
        },
        {
          language: "en",
          title: "English Title",
          description: "English Description",
        },
      ],
    }),
});
export const EditAwardSchema = z.object({
  image: z.string().url({ message: "Image must be a valid URL" }).optional(),
  translations: z
    .array(AwardTranslationSchema.extend({ id: z.number().optional() }))
    .refine(
      (translations) => {
        const languages = translations.map((t) => t.language);
        return languages.includes("en") && languages.includes("tr");
      },
      {
        message: "Both 'tr' and 'en' translations are required",
      }
    )
    .openapi({
      example: [
        {
          language: "tr",
          title: "Türkçe Başlık",
          description: "Türkçe Açıklama",
          id: 0,
        },
        {
          language: "en",
          title: "English Title",
          description: "English Description",
          id: 0,
        },
      ],
    }),
});

export const AwardResponseSchema = z
  .object({
    id: z.number().describe("The award ID"),
  })
  .merge(AwardSchema)
  .openapi({
    description: "Award Response Schema",
  });

export const AwardsResponseSchema = z
  .object({
    totalCount: z.number().describe("Total number of awards"),
    data: AwardResponseSchema.array().describe("List of awards"),
  })
  .openapi({
    description: "Awards Response Schema",
  });

export const AwardParamsSchema = z.object({
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

export const AwardsByLanguageSchema = z.object({
  totalCount: z.number(),
  data: z.array(
    z.object({
      id: z.number(),
      image: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ),
});

export type AwardInput = z.infer<typeof AwardSchema>;
export type EditAwardInput = z.infer<typeof EditAwardSchema>;
export type AwardResponse = z.infer<typeof AwardResponseSchema>;
