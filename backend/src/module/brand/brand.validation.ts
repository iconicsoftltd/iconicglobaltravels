import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const BrandValidation = z.object({
  name: z.string().min(1, "Name is required"),
  branchId: z.number().min(1, "branchId is required"),
});

export const verifyBrand = verifyBody(BrandValidation);
