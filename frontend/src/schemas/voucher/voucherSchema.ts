import { z } from "zod";

export const receiptVoucherSchema = z.object({
  type: z.enum(["PAYMENT", "RECEIPT", "CONTRA", "JOURNAL", "EXPENSE"]),
  voucherNo: z.string().min(1, "Voucher No is required"),
  date: z.string().optional(),
  narration: z.string().optional(),
  entries: z
    .array(
      z.object({
        particularId: z.number().min(1, "Select a valid account"),
        type: z.enum(["Debit", "Credit"]),
        amount: z.number().positive("Amount must be greater than 0"),
      })
    )
    .min(2, "At least two entries (one debit & one credit) required"),
});

export type FormData = z.infer<typeof receiptVoucherSchema>;