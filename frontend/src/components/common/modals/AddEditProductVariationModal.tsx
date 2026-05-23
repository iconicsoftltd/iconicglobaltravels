import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { requiredStar } from "@/utils/helper/requiredStar";
import { IProductVariation, ProductVariationData, productVariationSchema } from "@/schemas/admin/inventory/productVariationSchema";
import { useGetAllProductsQuery } from "@/components/store/api/inventory/productApi";
import { useGetAllSizesQuery } from "@/components/store/api/inventory/sizeApi";
import { useGetAllColorsQuery } from "@/components/store/api/inventory/colorApi";
import ButtonLoader from "@/components/loader/ButtonLoader";
import { GrNotes } from "react-icons/gr";

interface AddEditProductVariationModalProps {
  onClose: () => void;
  editingVariation?: IProductVariation | null;
  onCreate?: (data: ProductVariationData) => Promise<any>;
  onUpdate?: (id: number, data: ProductVariationData) => Promise<any>;
}

const AddEditProductVariationModal: React.FC<AddEditProductVariationModalProps> = ({
  onClose,
  editingVariation,
  onCreate,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductVariationData>({
    resolver: zodResolver(productVariationSchema),
  });


  /** Fetch dropdown data */
  const { data: productData } = useGetAllProductsQuery({});
  const { data: sizeData } = useGetAllSizesQuery({});
  const { data: colorData } = useGetAllColorsQuery({});

  const products = productData?.data ?? [];
  const sizes = sizeData?.data ?? [];
  const colors = colorData?.data ?? [];

  useEffect(() => {
    if (editingVariation) {
      reset({ ...editingVariation });
    } else {
      reset({
        productId: 0,
        sizeId: 0,
        colorId: 0,
        salePrice: 0,
        wholeSalePrice: 0,
      });
    }
  }, [editingVariation, reset]);

  /** Set select values when editingProduct and options are loaded */
  useEffect(() => {
    if (!editingVariation) return;

    if (products.length && editingVariation.productId) {
      const found = products.find(c => c.id === editingVariation?.productId);
      if (found) setValue("productId", found.id);
    }

    if (sizes.length && editingVariation.sizeId) {
      const found = sizes.find(sc => sc.id === editingVariation.sizeId);
      if (found) setValue("sizeId", found.id);
    }

    if (colors.length && editingVariation.colorId) {
      const found = colors.find(u => u.id === editingVariation.colorId);
      if (found) setValue("colorId", found.id);
    }

  }, [editingVariation, products, sizes, colors, setValue]);

  const onSubmit = async (data: ProductVariationData) => {
    try {
      if (editingVariation && onUpdate) await onUpdate(editingVariation.id, data);
      else if (onCreate) await onCreate(data);
      toast.success(`Variation ${editingVariation ? "updated" : "created"} successfully`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${editingVariation ? "update" : "create"} variation`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Product Select */}
      <Controller
        name="productId"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Product {requiredStar}</Label>
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(Number(val))}
              disabled={isSubmitting}
            >
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
          </div>
        )}
      />

      {/* Size Select */}
      <Controller
        name="sizeId"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Size {requiredStar}</Label>
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(Number(val))}
              disabled={isSubmitting}
            >
              <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>
                {sizes.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sizeId && <p className="text-red-500 text-xs">{errors.sizeId.message}</p>}
          </div>
        )}
      />

      {/* Color Select */}
      <Controller
        name="colorId"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Color {requiredStar}</Label>
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(Number(val))}
              disabled={isSubmitting}
            >
              <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
              <SelectContent>
                {colors.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.colorId && <p className="text-red-500 text-xs">{errors.colorId.message}</p>}
          </div>
        )}
      />

      {/* Prices */}
      <div className="space-y-2">
        <Label htmlFor="salePrice">Sale Price {requiredStar}</Label>
        <Input id="salePrice" type="number" {...register("salePrice")} />
        {errors.salePrice && <p className="text-red-500 text-xs">{errors.salePrice.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wholeSalePrice">Wholesale Price {requiredStar}</Label>
        <Input id="wholeSalePrice" type="number" {...register("wholeSalePrice")} />
        {errors.wholeSalePrice && <p className="text-red-500 text-xs">{errors.wholeSalePrice.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="red_outeline"
          className=""
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className=""
        >
          
          {isSubmitting ? <ButtonLoader /> : <GrNotes className="" />}
          {editingVariation ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditProductVariationModal;
