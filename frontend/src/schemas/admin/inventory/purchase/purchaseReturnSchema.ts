import { z } from "zod";

export const purchaseReturnSchema = z.object({
  purchaseId: z.number().min(1, "Purchase is required"),
  date: z.string().min(1, "Date is required"),
  challanNo: z.string().min(1, "Challan No is required"),
  paymentAccountId: z.coerce.number({message: "Payment Account is required"}),
  products: z
    .array(
      z.object({
        variationProductId: z.number().min(1, "Product is required"),
        quantity: z.number().int().positive("Quantity must be greater than 0"),
        damageQuantity: z.number().int().nonnegative().optional(),
        unitPrice: z.number().nonnegative("Unit price must be 0 or greater"),
      })
    )
    .min(1, "At least one product is required"),
});

export type PurchaseReturnFormValues = z.infer<typeof purchaseReturnSchema>;
