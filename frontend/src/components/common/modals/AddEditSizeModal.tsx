import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
;
import { ISize, SizeData, sizeSchema } from "@/schemas/admin/inventory/sizeSchema";
import ButtonLoader from "@/components/loader/ButtonLoader";
import { GrNotes } from "react-icons/gr";

interface AddEditSizeModalProps {
  onClose: () => void;
  editingSize?: ISize | null;
  onCreate?: (data: SizeData) => Promise<any>;
  onUpdate?: (id: number, data: SizeData) => Promise<any>;
}

const AddEditSizeModal: React.FC<AddEditSizeModalProps> = ({
  onClose,
  editingSize,
  onCreate,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SizeData>({
    resolver: zodResolver(sizeSchema),
  });

  useEffect(() => {
    if (editingSize) reset({ ...editingSize });
    else reset({name: "" });
  }, [editingSize, reset]);

  const onSubmit = async (data: SizeData) => {
    try {
      if (editingSize && onUpdate) await onUpdate(editingSize.id, data);
      else if (onCreate) await onCreate(data);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${editingSize ? "update" : "create"} size`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="space-y-2">
        <Label htmlFor="name">Name {requiredStar}</Label>
        <Input id="name" placeholder="Enter size name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
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
          {editingSize ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditSizeModal;
