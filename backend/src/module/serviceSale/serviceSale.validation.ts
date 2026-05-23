import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const saleSchema = z.object({
    branchId: z.number().min(1, "Branch is required"),
    date: z.string().min(1, "Date is required"),
    invoiceNo: z.string().min(1, "Invoice No is required"),
    customerId: z.number().min(1, "Customer is required"),
    paymentAccountId: z.number().min(1, "Payment Account is required"),
    totalPaymentAmount: z.number(),
    vat: z.number().optional(),
    discount: z.number().optional(),
    tc: z.number().optional(),
    products: z
        .array(
            z.object({
                serviceId: z.number().min(1, "Service is required"),
                quantity: z.number().positive(),
                unitPrice: z.number().nonnegative(),
            })
        )
        .min(1, "At least one product is required"),
});

export const verifyServiceSales = verifyBody(saleSchema);
