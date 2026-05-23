import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const ProductValidation = z.object({
  name: z.string().min(1, "Name is required"),
  branchId: z.number().min(1, "BranchId is required"),
  categoryId: z.number().min(1, "CategoryId is required"),
  subCategoryId: z.number().min(1, "SubCategoryId is required"),
  unitId: z.number().min(1, "UnitId is required"),
  brandId: z.number().min(1, "BrandId is required"),
  productCode: z.string().optional(),
  image: z.string().optional(),
});

export const verifyProduct = verifyBody(ProductValidation);
