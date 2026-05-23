import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

;

import ButtonLoader from "@/components/loader/ButtonLoader";
import { salaryStructureSchema } from "@/schemas/admin/inventory/salary/salaryStructureSchema";
import { useGetSalaryStructureByBranchQuery, useUpdateSalaryStructureMutation } from "@/components/store/api/inventory/salary/salaryStructureApi";

export type SalaryStructureProps = z.infer<typeof salaryStructureSchema>;

interface ISalaryStructure extends SalaryStructureProps {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateEditSalaryStructureModalProps {
  onClose: () => void;
  editing?: ISalaryStructure | null;
}

const CreateEditSalaryStructureModal: React.FC<CreateEditSalaryStructureModalProps> = ({
  onClose,
  editing,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SalaryStructureProps>({
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

  // fetch structure for branch if not editing (or even if editing to reflect current)
  const { data: salaryData, isLoading: salaryLoading } = useGetSalaryStructureByBranchQuery({});

  const [updateSalaryStructure, { isLoading: isUpdating }] =
    useUpdateSalaryStructureMutation();

  // initialize/reset form when editing or when salary structure loaded for branch
  useEffect(() => {
    if (editing) {
      reset({
        basicSalary: editing.basicSalary,
        houseRent: editing.houseRent,
        medical: editing.medical,
        transport: editing.transport,
        food: editing.food,
        casualLeave: editing.casualLeave,
        medicalLeave: editing.medicalLeave,
      });
    } else if (salaryData) {
      // if API returns existing structure for branch, populate
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
      // default
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
  }, [editing, salaryData, reset]);

  const onSubmit = async (data: SalaryStructureProps) => {
    try {
      // API is update only per your description; pass id from editing or from salaryData if exists
      const idToUpdate = editing?.id ?? salaryData?.id;
      if (!idToUpdate) {
        // No create endpoint described — so inform user (or you can implement create)
        toast.error("No salary structure found to update for this branch.");
        return;
      }

      await updateSalaryStructure({ id: idToUpdate, data }).unwrap();
      toast.success("Salary structure updated successfully");
      onClose();
    } catch (error: any) {
      console.error("Error updating salary structure:", error);
      toast.error(error?.data?.message || "Failed to update salary structure");
    }
  };

  const isLoading = isSubmitting || isUpdating || salaryLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basicSalary">Basic Salary</Label>
            <Input id="basicSalary" type="number" {...register("basicSalary", { valueAsNumber: true })} disabled={isLoading} />
            {errors.basicSalary && <p className="text-red-500 text-sm">{errors.basicSalary.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="houseRent">House Rent</Label>
            <Input id="houseRent" type="number" {...register("houseRent", { valueAsNumber: true })} disabled={isLoading} />
            {errors.houseRent && <p className="text-red-500 text-sm">{errors.houseRent.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical">Medical</Label>
            <Input id="medical" type="number" {...register("medical", { valueAsNumber: true })} disabled={isLoading} />
            {errors.medical && <p className="text-red-500 text-sm">{errors.medical.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transport">Transport</Label>
            <Input id="transport" type="number" {...register("transport", { valueAsNumber: true })} disabled={isLoading} />
            {errors.transport && <p className="text-red-500 text-sm">{errors.transport.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="food">Food</Label>
            <Input id="food" type="number" {...register("food", { valueAsNumber: true })} disabled={isLoading} />
            {errors.food && <p className="text-red-500 text-sm">{errors.food.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="casualLeave">Casual Leave (days)</Label>
            <Input id="casualLeave" type="number" {...register("casualLeave", { valueAsNumber: true })} disabled={isLoading} />
            {errors.casualLeave && <p className="text-red-500 text-sm">{errors.casualLeave.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalLeave">Medical Leave (days)</Label>
            <Input id="medicalLeave" type="number" {...register("medicalLeave", { valueAsNumber: true })} disabled={isLoading} />
            {errors.medicalLeave && <p className="text-red-500 text-sm">{errors.medicalLeave.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={onClose} disabled={isSubmitting} variant="red_outeline">Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? <ButtonLoader /> : <GrNotes />}
          Update
        </Button>
      </div>
    </div>
  );
};

export default CreateEditSalaryStructureModal;
