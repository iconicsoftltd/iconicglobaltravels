import { z } from "zod";

export const subCategoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.number().min(1, "Please select a category"),
});

export type SubCategoryCreateProps = z.infer<typeof subCategoryCreateSchema>;