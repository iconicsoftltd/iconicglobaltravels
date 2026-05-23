import { z } from "zod";

export const salesReturnSchema = z.object({
  saleId: z.number().min(1, "Sale ID is required"),
  date: z.string().min(1, "Date is required"), // should be an ISO date string
  invoiceNo: z.string().min(1, "Invoice No is required"),
  paymentAccountId: z.number().min(1, "Payment Account is required"),
  products: z
    .array(
      z.object({
        variationProductId: z.number().min(1, "Product variation is required"),
        quantity: z.number().int().positive("Quantity must be greater than 0"),
        damageQuantity: z
          .number()
          .int()
          .nonnegative("Damage quantity cannot be negative")
          .optional(),
        unitPrice: z.number().nonnegative("Unit price cannot be negative"),
      })
    )
    .min(1, "At least one product is required"),
});

// ✅ TypeScript type inference (optional)
export type SalesReturnFormValues = z.infer<typeof salesReturnSchema>;
