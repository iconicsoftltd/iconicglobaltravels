import { z } from "zod";

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "oldPassword is required")
      .max(16, "oldPassword is too long"),

    newPassword: z
      .string()
      .min(6, "newPassword is required")
      .max(16, "newPassword is too long"),

    confirmPassword: z
      .string()
      .min(6, "confirmPassword is required")
      .max(16, "confirmPassword is too long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"], 
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
