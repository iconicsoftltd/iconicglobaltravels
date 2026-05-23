import { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "react-hot-toast";
import {
  useGetSalaryStructureByBranchQuery,
  useUpdateSalaryStructureMutation,
} from "@/components/store/api/inventory/salary/salaryStructureApi";
import {
  SalaryStructureData,
  salaryStructureSchema,
} from "@/schemas/admin/inventory/salary/salaryStructureSchema";

export default function SalaryStructure() {

  // Fetch salary structure for current branch (skip when no branchId)
  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useGetSalaryStructureByBranchQuery({});

  // apiResponse.data is the salary structure object (or undefined)
  const salaryData = apiResponse?.data;

  const [updateSalaryStructure, { isLoading: isUpdating }] =
    useUpdateSalaryStructureMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SalaryStructureData>({
    resolver: zodResolver(salaryStructureSchema),
    defaultValues: {
      basicSalary: 0,
      houseRent: 0,
      medical: 0,
      transport: 0,
      food: 0,
      casualLeave: 0,
      medicalLeave: 0,
    },
  });

  // When API returns data, reset form to those values
  useEffect(() => {
    if (salaryData) {
      reset({
        basicSalary: salaryData.basicSalary ?? 0,
        houseRent: salaryData.houseRent ?? 0,
        medical: salaryData.medical ?? 0,
        transport: salaryData.transport ?? 0,
        food: salaryData.food ?? 0,
        casualLeave: salaryData.casualLeave ?? 0,
        medicalLeave: salaryData.medicalLeave ?? 0,
      });
    } else {
      // If no data for branch, reset to defaults (keeps branchId)
      reset({
        basicSalary: 0,
        houseRent: 0,
        medical: 0,
        transport: 0,
        food: 0,
        casualLeave: 0,
        medicalLeave: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaryData, reset]);

  async function onSubmit(values: SalaryStructureData) {

    try {
      await updateSalaryStructure({ id: 1, data: values }).unwrap();
      toast.success("Salary structure updated successfully");
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update. Try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Salary Structure Information</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT Side – Salary Inputs */}
            <div className="space-y-5">
              <div>
                <Label>Basic Salary %</Label>
                <Input
                  type="number"
                  {...register("basicSalary", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label>House Rent %</Label>
                <Input
                  type="number"
                  {...register("houseRent", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label>Medical %</Label>
                <Input
                  type="number"
                  {...register("medical", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label>Transport %</Label>
                <Input
                  type="number"
                  {...register("transport", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label>Food %</Label>
                <Input
                  type="number"
                  {...register("food", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* RIGHT Side – Leave Inputs */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold border-b pb-1">Leaves</h3>

              <div>
                <Label>Casual Leave (CL)</Label>
                <Input
                  type="number"
                  {...register("casualLeave", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label>Medical Leave (ML)</Label>
                <Input
                  type="number"
                  {...register("medicalLeave", { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button type="submit" disabled={isUpdating || isSubmitting}>
              {isUpdating ? "Saving..." : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

