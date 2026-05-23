import { z } from "zod";
import { verifyBody } from "../../middleware/validation";


const designationValidation = z.object({
    name: z.string().min(1, "Name is required"),
    branchId: z.number().min(1, "branchId is required"),
});

export const verifyDesignation = verifyBody(designationValidation) 