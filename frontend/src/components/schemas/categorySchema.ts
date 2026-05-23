import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CategoryCreateProps = z.infer<typeof categoryCreateSchema>;