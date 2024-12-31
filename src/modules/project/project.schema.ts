// Project SCHEMA

import * as z from "zod";
import "zod-openapi/extend";

export const ProjectTranslationSchema = z.object({
  language: z
    .enum(["en", "tr"])
    .refine((value) => ["en", "tr"].includes(value), {
      message: "Language must be one of 'en' or 'tr'",
    }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export const ProjectSchema = z.object({
  image: z.string().min(1, "Image is required"),
  translations: z
    .array(ProjectTranslationSchema)
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
export const EditProjectSchema = z.object({
  image: z.string().url({ message: "Image must be a valid URL" }).optional(),
  translations: z
    .array(ProjectTranslationSchema.extend({ id: z.number().optional() }))
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

export const ProjectResponseSchema = z
  .object({
    id: z.number().describe("The project ID"),
  })
  .merge(ProjectSchema)
  .openapi({
    description: "Project Response Schema",
  });

export const ProjectsResponseSchema = z
  .object({
    totalCount: z.number().describe("Total number of projects"),
    data: ProjectResponseSchema.array().describe("List of projects"),
  })
  .openapi({
    description: "Projects Response Schema",
  });

export const ProjectParamsSchema = z.object({
  id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "ID must be a valid number",
    })
    .openapi({
      description: "The project ID",
    }),
});

export const ProjectsByLanguageSchema = z.object({
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

export type ProjectInput = z.infer<typeof ProjectSchema>;
export type EditProjectInput = z.infer<typeof EditProjectSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
