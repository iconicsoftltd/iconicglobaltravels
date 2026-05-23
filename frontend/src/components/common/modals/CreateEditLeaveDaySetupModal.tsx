import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

;

import ButtonLoader from "@/components/loader/ButtonLoader";
import { leaveDaySetupSchema } from "@/schemas/admin/inventory/leave/leaveDaySetupSchema";
import {
  useCreateLeaveDaySetupMutation,
  useGetLeaveDaySetupByIdQuery,
  useUpdateLeaveDaySetupMutation,
} from "@/components/store/api/inventory/leave/leaveDaySetupApi";

export type LeaveDaySetupProps = z.infer<typeof leaveDaySetupSchema>;

interface ILeaveDaySetup extends LeaveDaySetupProps {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateEditLeaveDaySetupModalProps {
  onClose: () => void;
  editing?: ILeaveDaySetup | null;
}

const CreateEditLeaveDaySetupModal: React.FC<CreateEditLeaveDaySetupModalProps> = ({
  onClose,
  editing,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeaveDaySetupProps>({
    resolver: zodResolver(leaveDaySetupSchema),
    defaultValues: {
      name: "",
      days: 1,
    },
  });

  const [createLeaveDaySetup, { isLoading: isCreating }] =
    useCreateLeaveDaySetupMutation();
  const [updateLeaveDaySetup, { isLoading: isUpdating }] =
    useUpdateLeaveDaySetupMutation();

  const { data: existing, isLoading: fetchingExisting } =
    useGetLeaveDaySetupByIdQuery(editing?.id, { skip: !editing?.id });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        days: editing.days,
      });
    } else if (existing) {
      reset({
        name: existing.name,
        days: existing.days,
      });
    } else {
      reset({
        name: "",
        days: 1,
      });
    }
  }, [editing, existing, reset]);

  const onSubmit = async (data: LeaveDaySetupProps) => {
    try {
      const payload = {
        name: data.name,
        days: data.days,
      };

      if (editing) {
        await updateLeaveDaySetup({ id: editing.id, data: payload }).unwrap();
        toast.success("Leave Day Setup updated successfully");
      } else {
        await createLeaveDaySetup(payload).unwrap();
        toast.success("Leave Day Setup created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting leave day setup:", error);
      toast.error(
        error?.data?.message ||
          `Failed to ${editing ? "update" : "create"} leave day setup`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting || fetchingExisting;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name {requiredStar}</Label>
          <Input
            id="name"
            placeholder="Enter name"
            {...register("name")}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="days">Days {requiredStar}</Label>
          <Input
            id="days"
            type="number"
            {...register("days", { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.days && (
            <p className="text-red-500 text-sm">{errors.days.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="red_outeline"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? <ButtonLoader /> : <GrNotes />}
          {editing ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEditLeaveDaySetupModal;
