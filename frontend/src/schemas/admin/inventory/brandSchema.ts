import * as z from "zod";

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type BrandData = z.infer<typeof brandSchema>;

export interface IBrand extends BrandData {
  id: number;
}
