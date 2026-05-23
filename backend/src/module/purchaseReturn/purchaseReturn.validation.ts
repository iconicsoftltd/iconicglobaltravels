import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

// Purchase validation schema
export const purchaseReturnSchema = z.object({
    branchId: z.number().min(1, "Branch is required"),
    purchaseId: z.number().min(1, "Purchase is required"),
    date: z.string().min(1, "Date is required"), // ISO date string
    challanNo: z.string().min(1, "Challan No is required"),
    paymentAccountId: z.number().min(1, "Payment Account is required"),
    products: z.array(
        z.object({
            variationProductId: z.number(),
            quantity: z.number().int().positive(),
            damageQuantity: z.number().int().nonnegative().optional(),
            unitPrice: z.number().nonnegative(),
        })
    ).min(1, "At least one product is required")
});

export const verifyPurchaseReturn = verifyBody(purchaseReturnSchema);
