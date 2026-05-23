import { z } from "zod";

// ===== Common Fields =====
const branchBaseSchema = {
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  logo: z.string().optional(),      // optional if logo upload is optional
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  isActive: z.coerce.boolean(),
};

// ===== Create Branch Schema =====
export const branchCreateSchema = z.object({
  ...branchBaseSchema,
});

// ===== Update Branch Schema =====
// Usually update allows partial data
export const branchUpdateSchema = z.object({
  ...branchBaseSchema,
});

// ===== Types =====
export type BranchCreateProps = z.infer<typeof branchCreateSchema>;
export type BranchUpdateProps = z.infer<typeof branchUpdateSchema>;
