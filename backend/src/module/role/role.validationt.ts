import { z } from "zod";
import { verifyBody } from "../../middleware/validation";


const RoleValidation = z.object({
    name: z.string().min(1, "Name is required"),
    branchId: z.number().min(1, "branchId is required"),
    description: z.string().optional(),
    isSystemRole: z.boolean().optional().default(false),
    permissions: z.array(z.object({
        permissionId: z.number().min(1, "permissionId is required"),
        isAllowed: z.boolean().default(false),
    })).min(1, "At least one permission is required"),
});

export const verifyRole = verifyBody(RoleValidation) 