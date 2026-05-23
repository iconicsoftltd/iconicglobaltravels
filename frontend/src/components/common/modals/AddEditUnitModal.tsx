import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
;
import { IUnit, UnitData, unitSchema } from "@/schemas/admin/inventory/unitSchema";
import ButtonLoader from "@/components/loader/ButtonLoader";
import { GrNotes } from "react-icons/gr";

interface AddEditUnitModalProps {
  onClose: () => void;
  editingUnit?: IUnit | null;
  onCreate?: (data: UnitData) => Promise<any>;
  onUpdate?: (id: number, data: UnitData) => Promise<any>;
}

const AddEditUnitModal: React.FC<AddEditUnitModalProps> = ({
  onClose,
  editingUnit,
  onCreate,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitData>({
    resolver: zodResolver(unitSchema),
  });


  useEffect(() => {
    if (editingUnit) reset({ ...editingUnit });
    else reset({name: "" });
  }, [editingUnit, reset]);

  const onSubmit = async (data: UnitData) => {
    try {
      if (editingUnit && onUpdate) await onUpdate(editingUnit.id, data);
      else if (onCreate) await onCreate(data);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${editingUnit ? "update" : "create"} unit`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="space-y-2">
        <Label htmlFor="name">Name {requiredStar}</Label>
        <Input id="name" placeholder="Enter unit name" {...register("name")} />
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
          {editingUnit ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditUnitModal;
