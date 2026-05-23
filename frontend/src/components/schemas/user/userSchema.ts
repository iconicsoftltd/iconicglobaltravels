import { z } from "zod";

export const userCreateSchema = z.object({
  roleId: z.number().min(1, "RoleId is required"),
  employeeId: z.number().min(1, "EmployeeId is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must not exceed 16 characters"),
});

//  Type inference (optional)
export type UserCreateSchemaType = z.infer<typeof userCreateSchema>;
