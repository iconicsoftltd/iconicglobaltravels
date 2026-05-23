import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  LeaveApplyUpdateData,
  leaveApplyUpdateSchema,
} from "@/schemas/admin/inventory/leave/leaveApplyUpdateSchema";

import toast from "react-hot-toast";
import { useUpdateLeaveApplyMutation } from "@/components/store/api/inventory/leave/leaveApplyApi";




interface EditLeaveApplyModalProps {
  open: boolean;
  onClose: () => void;
  defaultValues: LeaveApplyUpdateData & { id: number};
  refetch?: () => void;
}

export default function EditLeaveApplyModal({
  open,
  onClose,
  defaultValues,
  refetch,
}: EditLeaveApplyModalProps) {
  const [updateLeaveApply, { isLoading }] = useUpdateLeaveApplyMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeaveApplyUpdateData>({
    resolver: zodResolver(leaveApplyUpdateSchema),
    defaultValues,
  });


  const onSubmit = async (data: LeaveApplyUpdateData) => {

    try {
      await updateLeaveApply({
        id: defaultValues.id,
        data: { ...data },
      }).unwrap();

      toast.success("Leave application updated successfully");
      refetch?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Leave Application</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">

          {/* Note */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Note</label>
            <Textarea placeholder="Write a note..." {...register("note")} />
            {errors.note && (
              <p className="text-red-500 text-sm">{errors.note.message}</p>
            )}
          </div>

          {/* Approve From Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Approve From Date</label>
            <Input type="date" {...register("approveFromDate")} />
            {errors.approveFromDate && (
              <p className="text-red-500 text-sm">
                {errors.approveFromDate.message}
              </p>
            )}
          </div>

          {/* Approve To Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Approve To Date</label>
            <Input type="date" {...register("approveToDate")} />
            {errors.approveToDate && (
              <p className="text-red-500 text-sm">
                {errors.approveToDate.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <Select
              defaultValue={defaultValues.status}
              onValueChange={(val) => setValue("status", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
