import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import {
  BrandData,
  brandSchema,
  IBrand,
} from "@/schemas/admin/inventory/brandSchema";
import { GrNotes } from "react-icons/gr";
import ButtonLoader from "@/components/loader/ButtonLoader";

interface AddEditBrandModalProps {
  onClose: () => void;
  editingBrand?: IBrand | null;
  onCreate?: (data: BrandData) => Promise<any>;
  onUpdate?: (id: number, data: BrandData) => Promise<any>;
}

const AddEditBrandModal: React.FC<AddEditBrandModalProps> = ({
  onClose,
  editingBrand,
  onCreate,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandData>({
    resolver: zodResolver(brandSchema),
  });


  useEffect(() => {
    if (editingBrand) {
      reset({ ...editingBrand });
    } else {
      reset({ name: "" });
    }
  }, [editingBrand, reset]);

  const onSubmit = async (data: BrandData) => {
    try {
      if (editingBrand && onUpdate) await onUpdate(editingBrand.id, data);
      else if (onCreate) await onCreate(data);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          `Failed to ${editingBrand ? "update" : "create"} brand`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="space-y-2">
        <Label htmlFor="name">Name {requiredStar}</Label>
        <Input id="name" placeholder="Enter brand name" {...register("name")} />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name.message}</p>
        )}
      </div>

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
          {editingBrand ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditBrandModal;
