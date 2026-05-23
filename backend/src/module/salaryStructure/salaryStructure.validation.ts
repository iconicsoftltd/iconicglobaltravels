import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const salaryStructureSchema = z.object({
    branchId: z.number().min(1, "Branch is required"),
    basicSalary: z.number().min(0).default(0),
    houseRent: z.number().min(0).default(0),
    medical: z.number().min(0).default(0),
    transport: z.number().min(0).default(0),
    food: z.number().min(0).default(0),
    casualLeave: z.number().min(0).default(0),
    medicalLeave: z.number().min(0).default(0),
});

export const verifySalaryStructure = verifyBody(salaryStructureSchema);
