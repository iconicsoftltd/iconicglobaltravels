import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const particularValidation = z.object({
  branchId: z.number().min(1, "branchId is required"),
  ledgerId: z.number().min(1, "ledgerId is required"),
  type: z.enum(["Debit", "Credit"]).default("Debit"),
  openingBalance: z.number(),
  openingBalanceDate: z.string().optional(),
  companyName: z.string().optional(),
  accountType: z.string().min(1, "accountType is required"),
  mobileNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,15}$/.test(val),
      "mobileNumber must be valid (10–15 digits)"
    ),
  email: z.string().email("email must be valid").optional(),
  address: z.string().optional(),
});

export const verifyParticular = verifyBody(particularValidation);
