// salary.validation.ts
import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

export const salarySchema = z.object({
    branchId: z.number().min(1, "Branch is required"),
    employeeId: z.number().min(1, "Employee is required"),
    date: z.string().min(1, "Date is required"),
    month: z.number().min(1, "Month is required").max(12, "Month must be between 1 and 12"),
    year: z.number().min(1, "Year is required"),
    paymentAccountId: z.number().min(1, "Payment Account is required"),
    grossSalary: z.number().min(1, "Gross Salary is required"),
    weekendAllowance: z.number().optional(),
    holidayAllowance: z.number().optional(),
    bonus: z.number().optional(),
    provident: z.number().optional(),
    advance: z.number().optional(),
    lateFee: z.number().optional(),
    absentFee: z.number().optional(),
    unauthorizedLeave: z.number().optional(),
    deduct: z.number().optional(),
});

export const verifySalary = verifyBody(salarySchema);
