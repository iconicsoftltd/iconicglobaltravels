import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const LeaveDaySetupValidation = z.object({
  branchId: z.number().min(1, "Branch ID is required"),
  name: z.string().min(1, "Name is required"),
  days: z.number().min(1, "Days must be at least 1"),
});

export const verifyLeaveDaySetup = verifyBody(LeaveDaySetupValidation);
