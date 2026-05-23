import { z } from "zod";
import { verifyBody } from "../../middleware/validation";


const DepartmentValidation = z.object({
    name: z.string().min(1, "Name is required"),
    branchId: z.number().min(1, "branchId is required"),
});

export const verifyDepartment = verifyBody(DepartmentValidation) 