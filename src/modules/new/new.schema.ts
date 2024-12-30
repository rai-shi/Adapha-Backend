import { z } from "zod";

export const NewTranslationSchema = z.object({
  language: z
    .enum(["en", "tr"])
    .refine((value) => ["en", "tr"].includes(value), {
      message: "Language must be one of 'en' or 'tr'",
    }),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
});

export const createNewSchema = z.object({
  categoryId: z.number(),
  image: z.string().min(1, "Image is required"),
  author: z.string().min(1, "Author is required"),
  translations: z
    .array(NewTranslationSchema)
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
          slug: "turkce-baslik",
          description: "Türkçe Açıklama",
          content: "Türkçe İçerik",
        },
        {
          language: "en",
          title: "English Title",
          slug: "english-title",
          description: "English Description",
          content: "English Content",
        },
      ],
    }),
});

export const newsBaseSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  image: z.string(),
  featured: z.boolean(),
  author: z.string(),
  createdAt: z.date(),
  translations: z.array(
    NewTranslationSchema.extend({
      id: z.number(),
      newId: z.number(),
    })
  ),
});

export const getAllNewsResponseSchema = z.object({
  totalCount: z.number(),
  data: z.array(
    newsBaseSchema.extend({
      category: z.object({
        id: z.number(),
        translations: z.array(
          z.object({
            id: z.number(),
            language: z.enum(["en", "tr"]),
            title: z.string(),
            categoryId: z.number(),
          })
        ),
      }),
    })
  ),
});

export const getNewByLanguageResponseSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  categoryName: z.string(),
  image: z.string(),
  featured: z.boolean(),
  author: z.string(),
  createdAt: z.date(),
  language: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  content: z.string(),
});

export const getNewsByLanguageSchema = z.object({
  totalCount: z.number(),
  data: z.array(getNewByLanguageResponseSchema),
});

export const updateNewSchema = z.object({
  id: z.number().min(1, "ID is required"),
  categoryId: z.number().min(1, "Category is required"),
  image: z.string().min(1, "Image is required"),
  featured: z.boolean().optional(),
  author: z.string().min(1, "Author is required"),
  translations: z
    .array(
      NewTranslationSchema.extend({
        id: z.number().optional(),
      })
    )
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
          slug: "turkce-baslik",
          description: "Türkçe Açıklama",
          content: "Türkçe İçerik",
        },
        {
          language: "en",
          title: "English Title",
          slug: "english-title",
          description: "English Description",
          content: "English Content",
        },
      ],
    }),
});

export const getAllFeaturedNewsResponseSchema = z.array(newsBaseSchema);
export const getAllFeaturedNewsByLanguageResponseSchema = z.array(
  getNewByLanguageResponseSchema
);
export const createNewResponseSchema = newsBaseSchema;
export const getNewsByIdResponseSchema = newsBaseSchema;

export type UpdateNewInput = z.infer<typeof updateNewSchema>;
export type NewInput = z.infer<typeof createNewSchema>;
