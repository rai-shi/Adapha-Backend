import * as z from "zod";

export const userCore = {
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email is not valid",
    })
    .email(),
};

const passwordComplexity = {
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialCharacter: /[!@#$%^&*(),.?":{}|<>]/,
};

export const createUserSchema = z.object({
  ...userCore,
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters long." })
    .refine((password) => passwordComplexity.hasUppercase.test(password), {
      message: "Password must contain at least one uppercase letter.",
    })
    .refine((password) => passwordComplexity.hasLowercase.test(password), {
      message: "Password must contain at least one lowercase letter.",
    })
    .refine((password) => passwordComplexity.hasNumber.test(password), {
      message: "Password must contain at least one number.",
    })
    .refine(
      (password) => passwordComplexity.hasSpecialCharacter.test(password),
      {
        message: "Password must contain at least one special character.",
      }
    ),
});

export const createUserResponseSchema = z.object({
  id: z.number(),
  ...userCore,
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email is not valid",
    })
    .email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  email: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
