import { z } from "zod";

export const createEditServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  price: z.number().min(1, "Service price must be greater than or equal to 0"),
  description: z.string().optional(),
});

export type CreateEditServiceProps = z.infer<typeof createEditServiceSchema>;
