import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const ServiceValidation = z.object({
  name: z.string().min(1, "Service name is required"),
  price: z.number().min(0, "Service price must be greater than or equal to 0"),
  branchId: z.number().min(1, "Branch ID is required"),
  description: z.string().optional(),
});

export const verifyService = verifyBody(ServiceValidation);
