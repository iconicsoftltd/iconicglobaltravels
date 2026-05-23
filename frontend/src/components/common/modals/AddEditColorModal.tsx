import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import {
  ColorData,
  colorSchema,
  IColor,
} from "@/schemas/admin/inventory/colorSchema";
import ButtonLoader from "@/components/loader/ButtonLoader";
import { GrNotes } from "react-icons/gr";

interface AddEditColorModalProps {
  onClose: () => void;
  editingColor?: IColor | null;
  onCreate?: (data: ColorData) => Promise<any>;
  onUpdate?: (id: number, data: ColorData) => Promise<any>;
}

const AddEditColorModal: React.FC<AddEditColorModalProps> = ({
  onClose,
  editingColor,
  onCreate,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ColorData>({
    resolver: zodResolver(colorSchema),
  });

  useEffect(() => {
    if (editingColor) reset({ ...editingColor });
    else reset({ name: "" });
  }, [editingColor, reset]);

  const onSubmit = async (data: ColorData) => {
    try {
      if (editingColor && onUpdate) await onUpdate(editingColor.id, data);
      else if (onCreate) await onCreate(data);
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          `Failed to ${editingColor ? "update" : "create"} color`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="space-y-2">
        <Label htmlFor="name">Name {requiredStar}</Label>
        <Input id="name" placeholder="Enter color name" {...register("name")} />
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
          {editingColor ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditColorModal;
