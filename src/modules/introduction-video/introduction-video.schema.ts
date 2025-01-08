import * as z from "zod";
import "zod-openapi/extend";
import { queryStringBaseSchema } from "../../utils/schema";

export const IntroductionVideoTranslationSchema = z.object({
  language: z
    .enum(["en", "tr"])
    .refine((value) => ["en", "tr"].includes(value), {
      message: "Language must be one of 'en' or 'tr'",
    }),
  title: z.string().min(1, "Title is required"),
});

export const IntroductionVideoSchema = z.object({
  image: z.string().min(1, "Image is required"),
  url: z.string().min(1, "Url is required"),
  translations: z
    .array(IntroductionVideoTranslationSchema)
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
        },
        {
          language: "en",
          title: "English Title",
        },
      ],
    }),
});

export const IntroductionVideoResponseSchema = z
  .object({
    id: z.number(),
    image: z.string(),
    url: z.string(),
    translations: z.array(
      z.object({
        id: z.number(),
        language: z.enum(["tr", "en"]),
        title: z.string(),
      })
    ),
  })
  .openapi({
    description: "Introduction Video Response Schema",
    example: {
      id: 1,
      image: "https://example.com/image.png",
      url: "https://example.com/video.mp4",
      translations: [
        {
          id: 1,
          language: "tr",
          title: "Türkçe Başlık",
        },
        {
          id: 2,
          language: "en",
          title: "English Title",
        },
      ],
    },
  });

export const IntroductionVideosResponseSchema = z.object({
  totalCount: z.number(),
  data: z.array(IntroductionVideoResponseSchema),
});

export const editIntroductionVideoSchema = z.object({
  id: z.number().min(1, "ID is required"),
  image: z.string().min(1, "Image is required"),
  url: z.string().min(1, "Url is required"),
  translations: z
    .array(
      IntroductionVideoTranslationSchema.extend({
        id: z.number(),
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
          id: 0,
          language: "tr",
          title: "Türkçe Başlık",
        },
        {
          id: 0,
          language: "en",
          title: "English Title",
        },
      ],
    }),
});

export const getIntroductionVideosByLanguageResponseSchema = z.array(
  z.object({
    id: z.number(),
    image: z.string(),
    url: z.string(),
    title: z.string(),
  })
);

export const introductionVideoQueryStringSchema = queryStringBaseSchema.extend({
  "translations.title": z.string().optional().openapi({
    description: "Title query",
  }),
});

export type EditIntroductionVideoInput = z.infer<
  typeof editIntroductionVideoSchema
>;
export type IntroductionVideoInput = z.infer<typeof IntroductionVideoSchema>;
