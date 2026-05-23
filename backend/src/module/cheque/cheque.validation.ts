import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const ChequeValidation = z.object({
  branchId: z.number().min(1, "Branch ID is required"),
  bankId: z.number().min(1, "Bank ID is required"),
  customerId: z.number().min(1, "Customer ID is required"),
  chequeNumber: z.string().min(1, "Cheque number is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  checkDate: z.string().transform((val) => new Date(val)), // Expect ISO date string
  submitDate: z.string().transform((val) => new Date(val)),
  status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
});

export const verifyCheque = verifyBody(ChequeValidation);
