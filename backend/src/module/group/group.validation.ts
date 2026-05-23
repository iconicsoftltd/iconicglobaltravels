import { z } from "zod";
import { verifyBody } from "../../middleware/validation";


const groupValidation = z.object({
    branchId: z.number().min(1, "branchId is required"),
    account: z.enum(["Assets", "Liability", "Equity", "Income", "Expense", "Other_Accounts"]).default("Other_Accounts"),
    accountType: z.string().min(1, "accountType is required"),
    code: z.string().optional(),
});

export const verifyGroup = verifyBody(groupValidation) 