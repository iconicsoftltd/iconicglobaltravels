import * as z from "zod";

export const leaveApplySchema = z.object({
  employeeId: z.number().min(1, "Employee ID is required"),
  leaveId: z.number().min(1, "Leave Type ID is required"),
  fromDays: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid From Date"),
  toDays: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid To Date"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
});

export type LeaveApplyData = z.infer<typeof leaveApplySchema>;

export interface ILeaveApply extends LeaveApplyData {
  id: number;
  status?: "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
  note?: string;
  approveFromDate?: string;
  approveToDate?: string;
}
