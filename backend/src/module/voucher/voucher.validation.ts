import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

export const voucherSchema = z.object({
  branchId: z.number(),
  type: z.enum(["PAYMENT", "RECEIPT", "CONTRA", "JOURNAL", "EXPENSE"]),
  date: z.string().optional(),
  narration: z.string().optional(),
  voucherNo: z.string().min(1, "Voucher No is required"),
  entries: z.array(
    z.object({
      particularId: z.number(),
      type: z.enum(["Debit", "Credit"]),
      amount: z.number().positive(),
    })
  ).min(2, "At least two entries (one debit & one credit) required")
});


export const verifyVoucher = verifyBody(voucherSchema)