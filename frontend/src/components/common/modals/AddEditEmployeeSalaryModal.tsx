import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import ButtonLoader from "@/components/loader/ButtonLoader";
import toast from "react-hot-toast";

import { useGetAllEmployeesQuery } from "@/components/store/api/employee/employeeApi";
import {
  EmployeeSalaryData,
  employeeSalarySchema,
  IEmployeeSalary,
} from "@/schemas/admin/employee/employeeSalarySchema";
import { useGetAllAccountsParticularQuery } from "@/components/store/api/particularAccount/particularAccountApi";

interface Props {
  onClose: () => void;
  editingSalary?: IEmployeeSalary | null;
  onCreate?: (data: EmployeeSalaryData) => Promise<any>;
  onUpdate?: (id: number, data: EmployeeSalaryData) => Promise<any>;
}

export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const AddEditEmployeeSalaryModal: React.FC<Props> = ({
  onClose,
  editingSalary,
  onCreate,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeSalaryData>({
    resolver: zodResolver(employeeSalarySchema),
  });

  const { data: employeeData } = useGetAllEmployeesQuery({});
  const { data: allAccounts } = useGetAllAccountsParticularQuery({});

  useEffect(() => {
    if (editingSalary) {
      const voucherDate = editingSalary.vouchers?.[0]?.date;

      reset({
        ...editingSalary,
        date: voucherDate
          ? voucherDate.split("T")[0] 
          : "",
      });
    } else {
      const now = new Date();

      reset({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        date: now.toISOString().split("T")[0],
      });
    }
  }, [editingSalary, reset]);

  const onSubmit = async (data: EmployeeSalaryData) => {
    try {
      if (editingSalary && onUpdate) {
        await onUpdate(editingSalary.id, data);
        toast.success("Salary updated successfully");
      } else if (onCreate) {
        await onCreate(data);
        toast.success("Salary created successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const currentEmployeeId = watch("employeeId");
  if (editingSalary) {
    if (!currentEmployeeId) {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {/* Employee */}
        <div className="space-y-2">
          <Label>Employee {requiredStar}</Label>
          <Select
            onValueChange={(v) => setValue("employeeId", Number(v))}
            disabled={isSubmitting}
            value={String(watch("employeeId"))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employeeData?.data?.map((emp: any) => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employeeId && (
            <p className="text-xs text-red-500">{errors.employeeId.message}</p>
          )}
        </div>

        {/* Payment Account */}
        <div className="space-y-2">
          <Label>Payment Account {requiredStar}</Label>
          <Select
            onValueChange={(v) => setValue("paymentAccountId", Number(v))}
            disabled={isSubmitting}
            value={String(watch("paymentAccountId"))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {allAccounts?.data?.map((acc: any) => (
                <SelectItem key={acc.id} value={String(acc.id)}>
                  {acc.companyName} - {acc.accountType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.paymentAccountId && (
            <p className="text-xs text-red-500">
              {errors.paymentAccountId.message}
            </p>
          )}
        </div>

        {/* Date / Month / Year */}
        <div className="space-y-2">
          <Label>Date {requiredStar}</Label>
          <Input type="date" {...register("date")} />
        </div>
        <div className="space-y-2">
          <Label>Month {requiredStar}</Label>
          <Select
            onValueChange={(v) => setValue("month", Number(v))}
            disabled={isSubmitting}
            value={String(watch("month"))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS?.map((acc: any) => (
                <SelectItem key={acc.value} value={String(acc.value)}>
                  {acc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.paymentAccountId && (
            <p className="text-xs text-red-500">
              {errors.paymentAccountId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Year {requiredStar}</Label>
          <Input type="number" placeholder="Year" {...register("year")} />
        </div>

        {/* Salary Fields */}
        <div className="space-y-2">
          <Label>Gross Salary {requiredStar}</Label>
          <Input
            type="text"
            placeholder="Gross Salary"
            {...register("grossSalary")}
          />
        </div>

        <div className="space-y-2">
          <Label>Bonus</Label>
          <Input type="text" placeholder="Bonus" {...register("bonus")} />
        </div>

        <div className="space-y-2">
          <Label>Weekend Allowance</Label>
          <Input
            type="text"
            placeholder="Weekend Allowance"
            {...register("weekendAllowance")}
          />
        </div>

        <div className="space-y-2">
          <Label>Holiday Allowance</Label>
          <Input
            type="text"
            placeholder="Holiday Allowance"
            {...register("holidayAllowance")}
          />
        </div>

        <div className="space-y-2">
          <Label>Advance</Label>
          <Input type="text" placeholder="Advance" {...register("advance")} />
        </div>

        <div className="space-y-2">
          <Label>Provident</Label>
          <Input
            type="text"
            placeholder="Provident"
            {...register("provident")}
          />
        </div>

        <div className="space-y-2">
          <Label>Late Fee</Label>
          <Input type="text" placeholder="Late Fee" {...register("lateFee")} />
        </div>

        <div className="space-y-2">
          <Label>Absent Fee</Label>
          <Input
            type="text"
            placeholder="Absent Fee"
            {...register("absentFee")}
          />
        </div>
        <div className="space-y-2">
          <Label>Unauthorized Leave</Label>
          <Input
            type="text"
            placeholder="Unauthorized Leave"
            {...register("unauthorizedLeave")}
          />
        </div>

        <div className="space-y-2">
          <Label>Deduct</Label>
          <Input type="text" placeholder="Deduct" {...register("deduct")} />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="red_outeline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={isSubmitting}>
          {isSubmitting ? (
            <ButtonLoader />
          ) : editingSalary ? (
            "Update"
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddEditEmployeeSalaryModal;
