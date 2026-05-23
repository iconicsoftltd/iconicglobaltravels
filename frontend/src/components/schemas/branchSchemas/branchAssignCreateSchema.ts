import { z } from "zod";

export const branchAssignCreateSchema = z.object({
  userId: z.number().min(1, "UserId is required"),
  branchId: z.number().min(1, "BranchId is required"),
});

// Optional: Type inference for convenience
export type BranchAssignCreateSchemaType = z.infer<typeof branchAssignCreateSchema>;
