import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

;

import {
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
} from "@/components/store/api/inventory/subCategoryApi";
import { subCategoryCreateSchema } from "@/components/schemas/subCategorySchema";
import { useGetAllCategoriesQuery } from "@/components/store/api/inventory/categoryApi";
import ButtonLoader from "@/components/loader/ButtonLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SubCategoryCreateProps = z.infer<typeof subCategoryCreateSchema>;

interface SubCategoryType {
  id: number;
  branchId: number;
  categoryId: number;
  name: string;
  createdDate: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEditSubCategoryModalProps {
  onClose: () => void;
  editingDepartment?: SubCategoryType | null;
}

const CreateEditSubCategoryModal: React.FC<CreateEditSubCategoryModalProps> = ({
  onClose,
  editingDepartment,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    control,
  } = useForm<SubCategoryCreateProps>({
    resolver: zodResolver(subCategoryCreateSchema),
  });

  const [createSubCategory, { isLoading: isCreating }] =
    useCreateSubcategoryMutation();
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateSubcategoryMutation();

  watch("categoryId");

  // Fetch categories based on selected branch
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery({});

  // Initialize form with editing data or dynamic first branch
  useEffect(() => {
    if (editingDepartment) {
      const editingData = {
        name: editingDepartment.name,
        branchId: editingDepartment.branchId,
        categoryId: editingDepartment.categoryId,
      };
      reset(editingData);
    } else {
      reset({
        name: "",
        categoryId: 0,
      });
    }
  }, [editingDepartment, reset]);

  // Set categoryId when categories are loaded in edit mode
  useEffect(() => {
    if (
      editingDepartment &&
      categoriesData?.data &&
      categoriesData.data.length > 0
    ) {
      // Check if the editing category exists in the fetched categories
      const categoryExists = categoriesData.data.some(
        (category: any) => category.id === editingDepartment.categoryId
      );

      if (categoryExists) {
        setValue("categoryId", editingDepartment.categoryId);
      } else {
        // If category doesn't exist in current branch, show warning
        console.warn("Editing category not found in current branch categories");
        setValue("categoryId", 0);
      }
    }
  }, [categoriesData, editingDepartment, setValue]);

  const onSubmit = async (data: SubCategoryCreateProps) => {
    try {
      const payload = {
        name: data.name,
        categoryId: data.categoryId,
      };

      if (editingDepartment) {
        await updateDepartment({
          id: editingDepartment.id,
          data: payload,
        }).unwrap();
        toast.success("SubCategory updated successfully");
      } else {
        await createSubCategory(payload).unwrap();
        toast.success("SubCategory created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting subCategory:", error);
      toast.error(
        error?.data?.message ||
          `Failed to ${editingDepartment ? "update" : "create"} subCategory`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">

        {/* Category Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category {requiredStar}</Label>

          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  const numericValue = Number(value);
                  field.onChange(numericValue);
                }}
                disabled={isLoading || categoriesLoading}
              >
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="0">Select a category</SelectItem>
                  {categoriesData?.data?.map((category: any) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Validation error */}
          {errors.categoryId && (
            <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
          )}

          {/* Loading state */}
          {categoriesLoading && (
            <p className="text-blue-500 text-sm">Loading categories...</p>
          )}

          {/* Empty state */}
          {!categoriesLoading &&
            (!categoriesData?.data || categoriesData.data.length === 0) && (
              <p className="text-yellow-500 text-sm">
                No categories found for this branch
              </p>
            )}
        </div>

        {/* Sub Category Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Sub Category Name {requiredStar}</Label>
          <Input
            id="name"
            placeholder="Enter subCategory name"
            {...register("name")}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
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
          {editingDepartment ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEditSubCategoryModal;
