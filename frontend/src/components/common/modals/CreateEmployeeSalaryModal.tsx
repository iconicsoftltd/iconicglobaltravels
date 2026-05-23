import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { EmployeeSalaryData, employeeSalarySchema, IEmployeeSalary } from "@/schemas/admin/inventory/salary/employeeSalarySchema";
import { useCreateEmployeeSalaryMutation, useUpdateEmployeeSalaryMutation } from "@/components/store/api/inventory/salary/employeeSalaryApi";


interface Props {
  onClose: () => void;
  editingSalary?: IEmployeeSalary | null;
}

const CreateEmployeeSalaryModel: React.FC<Props> = ({
  onClose,
  editingSalary,
}) => {
  const [createSalary, { isLoading: isCreating }] =
    useCreateEmployeeSalaryMutation();
  const [updateSalary, { isLoading: isUpdating }] =
    useUpdateEmployeeSalaryMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeSalaryData>({
    resolver: zodResolver(employeeSalarySchema),
  });

  const onSubmit = async (data: EmployeeSalaryData) => {
    try {
      if (editingSalary) {
        await updateSalary({ id: editingSalary.id, ...data }).unwrap();
        toast.success("Employee salary updated successfully");
      } else {
        await createSalary(data).unwrap();
        toast.success("Employee salary created successfully");
      }
      onClose();
      reset();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save salary");
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Employee</Label>
          <Input type="number" {...register("employeeId")} />
          {errors.employeeId && (
            <p className="text-xs text-red-500">
              {errors.employeeId.message}
            </p>
          )}
        </div>

        <div>
          <Label>Gross Salary</Label>
          <Input type="number" {...register("grossSalary")} />
        </div>

        <div>
          <Label>Date</Label>
          <Input type="date" {...register("date")} />
        </div>

        <div>
          <Label>Month</Label>
          <Input type="number" {...register("month")} />
        </div>

        <div>
          <Label>Year</Label>
          <Input type="number" {...register("year")} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="red_outeline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {editingSalary ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default CreateEmployeeSalaryModel;
