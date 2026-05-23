import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  nid: z.string().min(1, "NID is required"),
  image: z.string().min(1, "Image is required"),
});

export type ProfileUpdateSchemaType = z.infer<typeof profileUpdateSchema>;
