import { z } from "zod";

export const createEditSalesSchema = z.object({
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
        variationProductId: z.number(),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1, "At least one product is required"),
});

export type CreateEditSalesFormValues = z.infer<typeof createEditSalesSchema>;
