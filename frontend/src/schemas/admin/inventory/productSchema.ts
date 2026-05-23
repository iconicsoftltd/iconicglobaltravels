import * as z from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.coerce.number().min(1, "CategoryId is required"),
  subCategoryId: z.coerce.number().min(1, "SubCategoryId is required"),
  unitId: z.coerce.number().min(1, "UnitId is required"),
  brandId: z.coerce.number().min(1, "BrandId is required"),
  productCode: z.string().optional(),
  image: z.string().optional(),
});

export type ProductData = z.infer<typeof productSchema>;

export interface IBranch {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubCategory {
  id: number;
  branchId: number;
  categoryId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUnit {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBrand {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct extends ProductData {
  id: number;
  branch: IBranch;
  category: ICategory;
  subCategory: ISubCategory;
  unit: IUnit;
  brand: IBrand;
  createdAt: string;
  updatedAt: string;
}
