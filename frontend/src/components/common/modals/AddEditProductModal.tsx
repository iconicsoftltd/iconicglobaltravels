import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { XCircle } from "lucide-react";
import { requiredStar } from "@/utils/helper/requiredStar";
import { IProduct, ProductData, productSchema } from "@/schemas/admin/inventory/productSchema";
import { useGetAllCategoriesQuery } from "@/components/store/api/inventory/categoryApi";
import { useGetAllSubcategoriesQuery } from "@/components/store/api/inventory/subCategoryApi";
import { useGetAllUnitsQuery } from "@/components/store/api/inventory/unitApi";
import { useGetAllBrandsQuery } from "@/components/store/api/inventory/brandApi";
import { useAddThumbnailMutation } from "@/components/store/api/file/fileApi";
import ButtonLoader from "@/components/loader/ButtonLoader";
import { GrNotes } from "react-icons/gr";

interface AddEditProductModalProps {
  onClose: () => void;
  editingProduct?: IProduct | null;
  onCreate?: (data: ProductData) => Promise<any>;
  onUpdate?: (id: number, data: ProductData) => Promise<any>;
}

const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  onClose,
  editingProduct,
  onCreate,
  onUpdate,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addThumbnail] = useAddThumbnailMutation();

  const { register, handleSubmit, setValue, reset, control, formState: { errors, isSubmitting } } = useForm<ProductData>({
    resolver: zodResolver(productSchema),
  });

  /** Fetch options */
  const { data: categoryData } = useGetAllCategoriesQuery({});
  const { data: subCategoryData } = useGetAllSubcategoriesQuery({});
  const { data: unitData } = useGetAllUnitsQuery({});
  const { data: brandData } = useGetAllBrandsQuery({});

  const categories = categoryData?.data ?? [];
  const subCategories = subCategoryData?.data ?? [];
  const units = unitData?.data ?? [];
  const brands = brandData?.data ?? [];

  /** Initialize form */
  useEffect(() => {
    if (editingProduct) {
      reset({ ...editingProduct });
      if (editingProduct.image) setPreview(editingProduct.image);
    } else {
      reset({
        name: "",
        categoryId: 0,
        subCategoryId: 0,
        unitId: 0,
        brandId: 0,
        productCode: "",
        image: "",
      });
    }
  }, [editingProduct, reset]);

  /** Set select values when editingProduct and options are loaded */
  useEffect(() => {
    if (!editingProduct) return;

    if (categories.length && editingProduct.categoryId) {
      const found = categories.find(c => c.id === editingProduct.categoryId);
      if (found) setValue("categoryId", found.id);
    }

    if (subCategories.length && editingProduct.subCategoryId) {
      const found = subCategories.find(sc => sc.id === editingProduct.subCategoryId);
      if (found) setValue("subCategoryId", found.id);
    }

    if (units.length && editingProduct.unitId) {
      const found = units.find(u => u.id === editingProduct.unitId);
      if (found) setValue("unitId", found.id);
    }

    if (brands.length && editingProduct.brandId) {
      const found = brands.find(b => b.id === editingProduct.brandId);
      if (found) setValue("brandId", found.id);
    }
  }, [editingProduct, categories, subCategories, units, brands, setValue]);


  /** File change */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setValue("image", selectedFile.name);
    setError(null);
  };

  /** Submit */
  const onSubmit = async (data: ProductData) => {
    try {
      let imageUrl = data.image || "";

      // if (!file && !preview) {
      //   toast.error("Product image is required");
      //   return;
      // }

      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        const uploadResponse = await addThumbnail(formData).unwrap();
        imageUrl = Array.isArray(uploadResponse?.data) ? uploadResponse.data[0] : uploadResponse.data;
      }

      const payload = { ...data, image: imageUrl };

      if (editingProduct && onUpdate) await onUpdate(editingProduct.id, payload);
      else if (onCreate) await onCreate(payload);

      toast.success(`Product ${editingProduct ? "updated" : "created"} successfully`);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to ${editingProduct ? "update" : "create"} product`);
    }
  };

  const isLoading = isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">

        <div className="space-y-2">
          <Label>Name {requiredStar}</Label>
          <Input {...register("name")} placeholder="Enter product name" disabled={isLoading} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        {/** Category Select */}
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Category {requiredStar}</Label>
              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(Number(val))} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-red-500 text-xs">{errors.categoryId.message}</p>}
            </div>
          )}
        />

        {/** Sub Category Select */}
        <Controller
          name="subCategoryId"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Sub Category {requiredStar}</Label>
              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(Number(val))} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Select sub-category" /></SelectTrigger>
                <SelectContent>
                  {subCategories.map((sc) => <SelectItem key={sc.id} value={String(sc.id)}>{sc.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.subCategoryId && <p className="text-red-500 text-xs">{errors.subCategoryId.message}</p>}
            </div>
          )}
        />

        {/** Unit Select */}
        <Controller
          name="unitId"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Unit {requiredStar}</Label>
              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(Number(val))} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {units.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.unitId && <p className="text-red-500 text-xs">{errors.unitId.message}</p>}
            </div>
          )}
        />

        {/** Brand Select */}
        <Controller
          name="brandId"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Brand {requiredStar}</Label>
              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(Number(val))} disabled={isLoading}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.brandId && <p className="text-red-500 text-xs">{errors.brandId.message}</p>}
            </div>
          )}
        />

        {/** Product Code */}
        <div className="space-y-2">
          <Label>Product Code</Label>
          <Input {...register("productCode")} placeholder="Product Code" disabled={isLoading} />
        </div>

        {/** Image Upload */}
        <div className="">
          {/* <Label className="font-medium text-gray-700">Product Image {requiredStar}</Label> */}
          <div className="flex items-end w-full gap-1">

            <div className="flex-grow">
              <Label className="font-medium text-gray-700">Product Image</Label>

              {/* Upload Box */}
              <label className="flex flex-col items-center justify-center w-full h-[48px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-all duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <p className="text-gray-400 text-sm text-center">
                  Click to upload
                </p>
              </label>

              {/* Error */}
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            {/* Preview Image (small, under the box) */}
            {preview && (
              <div className="relative w-[74px] h-[74px] border rounded overflow-hidden shadow-sm">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                    setValue("image", "");
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>


      </div>

      {/** Buttons */}
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
          {editingProduct ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditProductModal;
