import { z } from "zod";
import { verifyBody } from "../../middleware/validation";


const userBranchValidation = z.object({
    userId: z.number().min(1, "userId is required"),
    branchId: z.number().min(1, "branchId is required"),
});

export const verifyUserBranch = verifyBody(userBranchValidation) 