import * as z from "zod";

export const colorSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type ColorData = z.infer<typeof colorSchema>;

export interface IColor extends ColorData {
  id: number;
}
