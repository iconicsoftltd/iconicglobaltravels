import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

// Purchase validation schema
export const purchaseSchema = z.object({
  branchId: z.number(),
  date: z.string().min(1, "Date is required"), // ISO date string
  challanNo: z.string().min(1, "Challan No is required"),
  supplierId: z.number().min(1, "Supplier is required"),
  paymentAccountId: z.number().min(1, "Payment Account is required"),
  totalPaymentAmount: z.number(),
  vat: z.number().nonnegative().optional(),
  tc: z.number().nonnegative().optional(),
  products: z.array(
    z.object({
      variationProductId: z.number(),
      quantity: z.number().int().positive(),
      damageQuantity: z.number().int().nonnegative().optional(),
      unitPrice: z.number().nonnegative(),
    })
  ).min(1, "At least one product is required")
});

export const verifyPurchase = verifyBody(purchaseSchema);
