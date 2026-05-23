import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

// Sales validation schema
export const SalesReturnSchema = z.object({
    branchId: z.number().min(1, "Branch is required"),
    saleId: z.number().min(1, "Sale ID is required"),
    date: z.string().min(1, "Date is required"), // ISO date string
    invoiceNo: z.string().min(1, "Invoice No is required"),
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

export const verifySalesReturn = verifyBody(SalesReturnSchema);
