import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const ledgerValidation = z.object({
  branchId: z.number().min(1, "branchId is required"),
  groupAccountId: z.number().min(1, "groupAccountId is required"),
  ledgerType: z.string().min(1, "ledgerType is required"),
  code: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const verifyLedger = verifyBody(ledgerValidation);
