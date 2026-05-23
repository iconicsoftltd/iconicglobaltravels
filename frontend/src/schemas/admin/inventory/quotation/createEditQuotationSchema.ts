import { z } from "zod";

export const quotationCreateEditSchema = z.object({
  date: z.string().min(1, "Date is required"),
  invoiceNo: z.string().min(1, "Invoice No is required"),
  customerId: z.number().min(1, "Customer is required"),
  vat: z.number().optional(),
  discount: z.number().optional(),
  tc: z.number().optional(),
  products: z
    .array(
      z.object({
        variationProductId: z.number(),
        quantity: z.number().positive("Quantity must be greater than 0"),
        unitPrice: z.number().nonnegative("Unit price cannot be negative"),
      })
    )
    .min(1, "At least one product is required"),
});

export type QuotationCreateEditSchema = z.infer<typeof quotationCreateEditSchema>;
