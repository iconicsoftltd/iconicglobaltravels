import { z } from "zod";

export const departmentCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type DepartmentCreateProps = z.infer<typeof departmentCreateSchema>;