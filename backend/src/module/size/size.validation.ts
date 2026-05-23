import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const SizeValidation = z.object({
  name: z.string().min(1, "Name is required"),
  branchId: z.number().min(1, "BranchId is required"),
});

export const verifySize = verifyBody(SizeValidation);
