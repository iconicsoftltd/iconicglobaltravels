import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const ProductVariationValidation = z.object({
  branchId: z.number().min(1, "BranchId is required"),
  productId: z.number().min(1, "ProductId is required"),
  sizeId: z.number().min(1, "SizeId is required"),
  colorId: z.number().min(1, "ColorId is required"),
  salePrice: z.number().min(0, "SalePrice is required"),
  wholeSalePrice: z.number().min(0, "WholeSalePrice is required"),
});

export const verifyProductVariation = verifyBody(ProductVariationValidation);
