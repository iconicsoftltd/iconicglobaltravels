import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import ButtonLoader from "@/components/loader/ButtonLoader";
import { LeaveApplyData, leaveApplySchema } from "@/schemas/admin/inventory/leave/leaveApplySchema";
import { useCreateLeaveApplyMutation } from "@/components/store/api/inventory/leave/leaveApplyApi";
import { useGetAllLeaveDaySetupQuery } from "@/components/store/api/inventory/leave/leaveDaySetupApi";
import { useGetAllEmployeesQuery } from "@/components/store/api/employee/employeeApi";

interface CreateLeaveApplyModalProps {
  onClose: () => void;
}

const CreateLeaveApplyModal: React.FC<CreateLeaveApplyModalProps> = ({ onClose }) => {

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<LeaveApplyData>({
    resolver: zodResolver(leaveApplySchema),
    defaultValues: {
      employeeId: 0,
      leaveId: 0,
      fromDays: "",
      toDays: "",
      subject: "",
      content: "",
    },
  });


  // Fetch employees
  const { data: employeeData, isLoading: isEmployeeLoading } = useGetAllEmployeesQuery(
    { size: 100 },
  );

  // Fetch leave types
  const { data: leaveData, isLoading: isLeaveLoading } = useGetAllLeaveDaySetupQuery(
    { size: 100 },
  );

  const [createLeaveApply, { isLoading: isCreating }] = useCreateLeaveApplyMutation();

  const onSubmit = async (data: LeaveApplyData) => {
    try {
      await createLeaveApply(data).unwrap();
      toast.success("Leave apply created successfully");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create leave apply");
    }
  };

  const isLoading = isCreating || isSubmitting || isEmployeeLoading || isLeaveLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">

        <div className="space-y-2">
          <Label htmlFor="employeeId">Employee {requiredStar}</Label>
          <Controller
            control={control}
            name="employeeId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) => field.onChange(Number(val))}
                disabled={isLoading || !employeeData?.data?.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Select Employee</SelectItem>
                  {employeeData?.data.map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.employeeId && <p className="text-red-500 text-sm">{errors.employeeId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaveId">Leave Type {requiredStar}</Label>
          <Controller
            control={control}
            name="leaveId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) => field.onChange(Number(val))}
                disabled={isLoading || !leaveData?.data?.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Select Leave Type</SelectItem>
                  {leaveData?.data.map(leave => (
                    <SelectItem key={leave.id} value={String(leave.id)}>
                      {leave.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.leaveId && <p className="text-red-500 text-sm">{errors.leaveId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromDays">From Date {requiredStar}</Label>
          <Input type="date" {...register("fromDays")} disabled={isLoading} />
          {errors.fromDays && <p className="text-red-500 text-sm">{errors.fromDays.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="toDays">To Date {requiredStar}</Label>
          <Input type="date" {...register("toDays")} disabled={isLoading} />
          {errors.toDays && <p className="text-red-500 text-sm">{errors.toDays.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject {requiredStar}</Label>
          <Input {...register("subject")} disabled={isLoading} />
          {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content {requiredStar}</Label>
          <Input {...register("content")} disabled={isLoading} />
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
        </div>

      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onClose} disabled={isSubmitting} variant="red_outeline">Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? <ButtonLoader /> : <GrNotes />}
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CreateLeaveApplyModal;
