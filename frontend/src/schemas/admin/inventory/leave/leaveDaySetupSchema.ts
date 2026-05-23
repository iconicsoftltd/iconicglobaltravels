import * as z from "zod";

export const leaveDaySetupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  days: z.coerce.number().min(1, "Days must be at least 1"),
});

export type LeaveDaySetupData = z.infer<typeof leaveDaySetupSchema>;

export interface ILeaveDaySetup extends LeaveDaySetupData {
  id: number;
  createdAt: string;
  updatedAt: string;
}
