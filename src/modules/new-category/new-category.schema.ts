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
    .min(1, "At least one translation is required"),
});

export const createNewCategoryResponseSchema = z.object({
  id: z.number(),
  translations: z.array(NewCategoryTranslationSchema),
});

export const getNewCategoriesByLanguageResponseSchema = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
  })
);

export const getAllNewCategoriesResponseSchema = z.array(
  z.object({
    id: z.number(),
    translations: z.array(
      NewCategoryTranslationSchema.extend({
        id: z.number(),
        categoryId: z.number(),
      })
    ),
  })
);

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
  id: z.number(),
  translations: z.array(NewCategoryTranslationSchema.extend({ id: z.number().optional() })),
});

export type EditCategoryInput = z.infer<typeof editNewCategorySchema>;
export type NewCategoryInput = z.infer<typeof createNewCategorySchema>;
