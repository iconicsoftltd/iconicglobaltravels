import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const LeaveApplyValidation = z.object({
    branchId: z.number().min(1, "Branch ID is required"),
    employeeId: z.number().min(1, "Employee ID is required"),
    leaveId: z.number().min(1, "Leave Type ID is required"),
    fromDays: z
        .string()
        .refine((v) => !isNaN(Date.parse(v)), "Invalid From Date"),
    toDays: z
        .string()
        .refine((v) => !isNaN(Date.parse(v)), "Invalid To Date"),
    subject: z.string().min(1, "Subject is required"),
    content: z.string().min(1, "Content is required"),
});

export const verifyLeaveApply = verifyBody(LeaveApplyValidation);



const leaveApplyUpdateValidation = z.object({
    note: z.string().optional(),
    approveFromDate: z.string().optional(),
    approveToDate: z.string().optional(),
    status: z.enum(["Approved", "Rejected"]).optional(),
});

export const verifyLeaveApplyUpdate = verifyBody(leaveApplyUpdateValidation);

