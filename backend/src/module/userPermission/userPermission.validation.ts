import { z } from "zod";
import { verifyBody } from "../../middleware/validation";


const userPermissionValidation = z.object({
    userId: z.number().min(1, "UserId is required"),
    permissions: z.array(z.object({
        permissionId: z.number().min(1, "permissionId is required"),
        isAllowed: z.boolean().default(false),
    })).min(1, "At least one permission is required"),
});

export const verifyUserPermission = verifyBody(userPermissionValidation) 