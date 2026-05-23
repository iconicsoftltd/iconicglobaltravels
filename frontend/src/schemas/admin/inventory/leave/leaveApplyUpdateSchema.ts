import * as z from "zod";

export const leaveApplyUpdateSchema = z.object({
  note: z.string().optional(),
  approveFromDate: z.string().optional(),
  approveToDate: z.string().optional(),
  status: z.enum(["Approved", "Rejected"]).optional(),
});

export type LeaveApplyUpdateData = z.infer<typeof leaveApplyUpdateSchema>;
