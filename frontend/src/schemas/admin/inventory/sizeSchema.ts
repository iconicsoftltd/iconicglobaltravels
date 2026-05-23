import * as z from "zod";

export const sizeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type SizeData = z.infer<typeof sizeSchema>;

export interface ISize extends SizeData {
  id: number;
}
