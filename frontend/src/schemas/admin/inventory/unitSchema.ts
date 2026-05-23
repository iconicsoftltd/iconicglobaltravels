import * as z from "zod";

export const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type UnitData = z.infer<typeof unitSchema>;

export interface IUnit extends UnitData {
  id: number;
}
