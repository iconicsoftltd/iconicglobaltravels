import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const BankValidation = z.object({
  name: z.string().min(1, "Name is required"),
  branchId: z.number().min(1, "Branch ID is required"),
});

export const verifyBank = verifyBody(BankValidation);
