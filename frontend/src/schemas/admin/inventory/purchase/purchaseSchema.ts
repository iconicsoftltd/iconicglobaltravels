// ✅ ADD
import { z } from "zod";

export const purchaseSchema = z.object({
  date: z.string().min(1, "Date is required"),
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
  ).min(1, "Required"),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;


export interface PurchaseDetailsProps {
  purchaseData: {
    id: number;
    challanNo: string;
    date: string;
    vat: number;

    totalAmount: number;
    totalPaymentAmount: number;
    dueAmount: number;
    previousDue: number;

    PurchaseProduct: Array<{
      id: number;
      quantity: number;
      damageQuantity: number;
      unitPrice: number;
      subTotal: number;
      productVariation: {
        stockQuantity: number;
        salePrice: number;
        product: {
          name: string;
          image: string;
          brand?: {
            name: string;
          };
        };
        size?: {
          name: string;
        };
        color?: {
          name: string;
        };
      };
    }>;

    supplier?: {
      companyName?: string;
      email?: string;
      mobileNumber?: string;
      address?: string;
      balance?: number;
    };

    account?: {
      accountType?: string;
      balance?: number;
    };
  };
}
