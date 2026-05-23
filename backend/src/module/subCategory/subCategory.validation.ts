import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const SubCategoryValidation = z.object({
  name: z.string().min(1, "Name is required"),
  branchId: z.number().min(1, "branchId is required"),
  categoryId: z.number().min(1, "categoryId is required"),
});

export const verifySubCategory = verifyBody(SubCategoryValidation);
