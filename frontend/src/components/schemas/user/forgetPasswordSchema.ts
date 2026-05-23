import { z } from "zod";

export const forgetPasswordSchema = z
  .object({
    code: z.string().min(8, "Code is required"),

    newPassword: z
      .string()
      .min(6, "New Password is required")
      .max(16, "New Password is too long"),

    confirmPassword: z
      .string()
      .min(6, "Confirm Password is required")
      .max(16, "Confirm Password is too long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgetPasswordSchemaType = z.infer<typeof forgetPasswordSchema>;
