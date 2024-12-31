import { z } from "zod";

export const TeamMemberTranslationSchema = z.object({
  language: z
    .enum(["en", "tr"])
    .refine((value) => ["en", "tr"].includes(value), {
      message: "Language must be one of 'en' or 'tr'",
    }),
  title: z.string().optional(),
  role: z.string().min(1, "Role is required"),
});

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  image: z.string().min(1, "Image is required"),
  translations: z
    .array(TeamMemberTranslationSchema)
    .refine(
      (translations) => {
        const languages = translations.map((t) => t.language);
        return languages.includes("en") && languages.includes("tr");
      },
      {
        message: "Both 'tr' and 'en' translations of role are required",
      }
    )
    .openapi({
      example: [
        { language: "tr", role: "Akademisyen", title: "Dr. Öğr. Üyesi" },
        { language: "en", role: "Academic" },
      ],
    }),
});

export const createTeamMemberResponseSchema = z.object({});

export const getAllTeamMembersResponseSchema = z
  .object({
    totalCount: z.number().describe("Total number of team members"),
    data: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
          surname: z.string(),
          image: z.string(),
          translations: z.array(
            TeamMemberTranslationSchema.extend({
              title: z.string(),
              role: z.string(),
              teamMemberId: z.number(),
            })
          ),
        })
      )
      .describe("List of team members"),
  })
  .openapi({
    description: "Get all team members response",
  });

export const getTeamMemberByIdResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  image: z.string(),
  translations: z.array(
    TeamMemberTranslationSchema.extend({
      id: z.number(),
      title: z.string(),
      role: z.string(),
    })
  ),
});

export const editTeamMemberSchema = z.object({
  id: z.number().min(1, "ID is required"),
  name: z.string().min(1, "Author is required"),
  surname: z.string().min(1, "Surname is required"),
  image: z.string().min(1, "Image is required"),
  translations: z
    .array(
      TeamMemberTranslationSchema.extend({
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
          title: "Türkçe Ünvan",
          role: "Akademisyen",
        },
        {
          id: 0,
          language: "en",
          title: "English Title",
          role: "Academic",
        },
      ],
    }),
});

export const teamMembersByLanguageResponseSchema = z.object({
  totalCount: z.number(),
  data: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      surname: z.string(),
      image: z.string(),
      title: z.string(),
      role: z.string(),
    })
  ),
});

export type TeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type EditTeamMemberInput = z.infer<typeof editTeamMemberSchema>;
