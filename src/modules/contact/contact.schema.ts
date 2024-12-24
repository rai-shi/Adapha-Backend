import * as z from "zod";
import "zod-openapi/extend";

export const contactSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
      })
      .min(1, { message: "Name cannot be empty" }),
    surname: z
      .string({
        required_error: "Surname is required",
        invalid_type_error: "Surname must be a string",
      })
      .min(1, { message: "Surname cannot be empty" }),
    phone: z
      .string({
        required_error: "Phone is required",
        invalid_type_error: "Phone must be a string",
      })
      .regex(/^(0|[1-9]\d*)(\.\d+)?$/, { message: "Phone number not valid" }),
    email: z
      .string({
        required_error: "Email is required",
        invalid_type_error: "Email is not valid",
      })
      .email(),
    message: z
      .string({
        required_error: "Message is required",
        invalid_type_error: "Message must be a string",
      })
      .min(1, { message: "Message cannot be empty" }),
  })
  .openapi({
    description: "Contact information",
  });

export const contactResponseSchema = z
  .object({
    id: z.number().describe("The contact ID"),
  })
  .merge(contactSchema)
  .extend({
    createdAt: z.date().describe("The date the contact message was created"),
  })
  .openapi({
    description: "Contact information Response",
  });

export const contactsResponseSchema = z
  .object({
    totalCount: z.number().describe("Total number of contacts"),
    data: contactResponseSchema.array().describe("List of contacts"),
  })
  .openapi({
    description: "Contacts Response",
  });

export const paramsSchema = z.object({
  id: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "ID must be a valid number",
    })
    .openapi({
      description: "The contact ID",
    }),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactResponse = z.infer<typeof contactResponseSchema>;
