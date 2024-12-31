import { z } from "zod";

export const NewCategoryTranslationSchema = z.object({
  language: z
    .enum(["en", "tr"])
    .refine((value) => ["en", "tr"].includes(value), {
      message: "Language must be one of 'en' or 'tr'",
    }),
  title: z.string().min(1, "Title is required"),
});

export const createNewCategorySchema = z.object({
  translations: z
    .array(NewCategoryTranslationSchema)
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
        { language: "tr", title: "Türkçe Başlık" },
        { language: "en", title: "English Title" },
      ],
    }),
});

export const createNewCategoryResponseSchema = z.object({
  id: z.number(),
  translations: z.array(NewCategoryTranslationSchema),
});

export const getNewCategoriesByLanguageResponseSchema = z.object({
  totalCount: z.number(),
  data: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
    })
  ),
});

export const getAllNewCategoriesResponseSchema = z.object({
    totalCount: z.number().describe("Total number of contacts"),
    data: z
      .array(
        z.object({
          id: z.number(),
          translations: z.array(
            NewCategoryTranslationSchema.extend({
              id: z.number(),
              categoryId: z.number(),
            })
          ),
        })
      )
      .describe("List of new categories"),
  })
  .openapi({
    description: "Get all new categories response",
  });

export const getNewCategoryByIdResponseSchema = z.object({
  id: z.number(),
  translations: z.array(
    NewCategoryTranslationSchema.extend({
      id: z.number(),
      categoryId: z.number(),
    })
  ),
});

export const getNewCategoryByIdAndLanguageResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
});

export const editNewCategorySchema = z.object({
  // id: z.number(),
  translations: z
    .array(NewCategoryTranslationSchema.extend({ id: z.number().optional() }))
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
        { language: "tr", title: "Türkçe Başlık", id: 0 },
        { language: "en", title: "English Title", id: 0 },
      ],
    }),
});

export type EditCategoryInput = z.infer<typeof editNewCategorySchema>;
export type NewCategoryInput = z.infer<typeof createNewCategorySchema>;
