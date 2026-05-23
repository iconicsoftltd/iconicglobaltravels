import * as z from "zod";

export const productVariationSchema = z.object({
  productId: z.coerce.number().min(1, "ProductId is required"),
  sizeId: z.coerce.number().min(1, "SizeId is required"),
  colorId: z.coerce.number().min(1, "ColorId is required"),
  salePrice: z.coerce.number().min(0, "SalePrice is required"),
  wholeSalePrice: z.coerce.number().min(0, "WholeSalePrice is required"),
});

export type ProductVariationData = z.infer<typeof productVariationSchema>;

export interface IProductVariation extends ProductVariationData {
  id: number;
  product: {
    id: number;
    branchId: number;
    name: string;
    categoryId: number;
    subCategoryId: number;
    unitId: number;
    brandId: number;
    productCode: string;
    image: string;
    createdAt: string;
    updatedAt: string;
  };
  size: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  color: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  branch: {
    id: number;
    name: string;
    address: string;
    createdAt: string;
    updatedAt: string;
  };
}
