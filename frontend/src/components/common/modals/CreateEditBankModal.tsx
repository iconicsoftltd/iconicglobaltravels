import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
;
import ButtonLoader from "@/components/loader/ButtonLoader";
import { BankCreateProps, bankCreateSchema } from "@/schemas/admin/chequeManager/bankSchema";
import { useCreateBankMutation, useUpdateBankMutation } from "@/components/store/api/chequeManager/bankApi";

interface BankType {
  id: number;
  branchId: number;
  name: string;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateEditBankModalProps {
  onClose: () => void;
  editingBank?: BankType | null;
}

const CreateEditBankModal: React.FC<CreateEditBankModalProps> = ({
  onClose,
  editingBank,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BankCreateProps>({
    resolver: zodResolver(bankCreateSchema),
  });

  const [createBank, { isLoading: isCreating }] = useCreateBankMutation();
  const [updateBank, { isLoading: isUpdating }] = useUpdateBankMutation();

  useEffect(() => {
    if (editingBank) {
      const editingData = {
        name: editingBank.name,
        branchId: editingBank.branchId,
      };
      reset(editingData);
    } else {
      reset({
        name: "",
      });
    }
  }, [editingBank, reset]);

  const onSubmit = async (data: BankCreateProps) => {
    try {
      const payload = {
        name: data.name,
      };

      if (editingBank) {
        await updateBank({ id: editingBank.id, data: payload }).unwrap();
        toast.success("Bank updated successfully");
      } else {
        await createBank(payload).unwrap();
        toast.success("Bank created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting bank:", error);
      toast.error(
        error?.data?.message || `Failed to ${editingBank ? "update" : "create"} bank`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">

        {/* Bank Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Bank Name {requiredStar}</Label>
          <Input
            id="name"
            placeholder="Enter bank name"
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
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ButtonLoader /> : <GrNotes />}
          {editingBank ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEditBankModal;
