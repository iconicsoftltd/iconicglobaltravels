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
import { departmentCreateSchema } from "@/components/schemas/departmentSchema";
;
import { useCreateDesignationMutation, useUpdateDesignationMutation } from "@/components/store/api/designation/designationApi";
import ButtonLoader from "@/components/loader/ButtonLoader";

export type DepartmentCreateProps = z.infer<typeof departmentCreateSchema>;

interface DepartmentType {
  id: number;
  branchId: number;
  name: string;
  createdDate: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateDesignationModelProps {
  onClose: () => void;
  editingDepartment?: DepartmentType | null;
}

const CreateDesignationModel: React.FC<CreateDesignationModelProps> = ({
  onClose,
  editingDepartment,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DepartmentCreateProps>({
    resolver: zodResolver(departmentCreateSchema),
  });

  const [createDepartment, { isLoading: isCreating }] =
    useCreateDesignationMutation();
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDesignationMutation();

  // Initialize form with editing data or dynamic first branch
  useEffect(() => {
    if (editingDepartment) {
      reset({
        name: editingDepartment.name,
      });
    } else {
      reset({
        name: "",
      });
    }
  }, [editingDepartment, reset]);

  const onSubmit = async (data: DepartmentCreateProps) => {
    try {
      const payload = {
        name: data.name,
      };

      if (editingDepartment) {
        await updateDepartment({
          id: editingDepartment.id,
          ...payload,
        }).unwrap();
        toast.success("Designation updated successfully");
      } else {
        await createDepartment(payload).unwrap();
        toast.success("Designation created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting department:", error);
      toast.error(
        error?.data?.message ||
          `Failed to ${editingDepartment ? "update" : "create"} designation`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">

        {/* Department Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Designation Name {requiredStar}</Label>
          <Input
            id="name"
            placeholder="Enter designation name"
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
          {editingDepartment ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateDesignationModel;