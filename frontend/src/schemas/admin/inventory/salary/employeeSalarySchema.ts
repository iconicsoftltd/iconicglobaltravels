import * as z from "zod";

export const employeeSalarySchema = z.object({
  branchId: z.number().min(1, "Branch is required"),
  employeeId: z.number().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  month: z.number().min(1, "Month is required").max(12),
  year: z.number().min(1, "Year is required"),
  paymentAccountId: z.number().min(1, "Payment Account is required"),
  grossSalary: z.coerce.number().min(1, "Gross Salary is required"),

  weekendAllowance: z.coerce.number().optional(),
  holidayAllowance: z.coerce.number().optional(),
  bonus: z.coerce.number().optional(),
  provident: z.coerce.number().optional(),
  advance: z.coerce.number().optional(),
  lateFee: z.coerce.number().optional(),
  absentFee: z.coerce.number().optional(),
  unauthorizedLeave: z.coerce.number().optional(),
  deduct: z.coerce.number().optional(),
});

export type EmployeeSalaryData = z.infer<typeof employeeSalarySchema>;

export interface IEmployeeSalary extends EmployeeSalaryData {
  id: number;
  employeeName?: string;
}
