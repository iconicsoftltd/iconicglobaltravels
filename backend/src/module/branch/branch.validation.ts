import { z } from "zod";
import { verifyBody } from "../../middleware/validation";


const branchValidation = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "address is required"),
    logo: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const verifyBranch = verifyBody(branchValidation) 