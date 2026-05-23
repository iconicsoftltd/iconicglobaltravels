import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  branchAssignCreateSchema,
  BranchAssignCreateSchemaType,
} from "@/components/schemas/branchSchemas/branchAssignCreateSchema";
import {
  useCreateBranchAssignMutation,
  useUpdateBranchAssignMutation,
} from "@/components/store/api/branch/branchAssignApi";
import BranchIdDropdown from "@/utils/helper/getBranchIdDropdown";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetAllUsersQuery } from "@/components/store/api/user/userApi";
;
import ButtonLoader from "@/components/loader/ButtonLoader";
import { getFirstBranchId } from "@/utils/helper/getFirstBranchId";

interface BranchAssignType {
  userId: number;
  id: number;
  branchId: number;
  branch: {
    name: string;
  };
  user: {
    role: {
      name: string;
    };
    employee: {
      name: string;
      uuid: string;
      email: string;
    };
  };
}

interface CreateBranchAssignModelProps {
  onClose: () => void;
  editingBranch?: BranchAssignType | null;
}

const CreateBranchAssignModel: React.FC<CreateBranchAssignModelProps> = ({
  onClose,
  editingBranch,
}) => {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BranchAssignCreateSchemaType>({
    resolver: zodResolver(branchAssignCreateSchema),
  });

  const [createBranchAssign, ] =
    useCreateBranchAssignMutation();
  const [updateBranchAssign, ] =
    useUpdateBranchAssignMutation();

  const branchId = watch("branchId");
  const currentBranchId = branchId || getFirstBranchId();

  // Fetch users based on branchId
  const { data: usersData } = useGetAllUsersQuery(
    { branchId: currentBranchId },
    { skip: !currentBranchId }
  );

  const users = usersData?.data || [];

  // Initialize form with editing data
  useEffect(() => {
    if (editingBranch) {
      reset({
        branchId: editingBranch.branchId,
        userId: editingBranch.userId,
      });
    } else {
      reset({
        branchId: getFirstBranchId(),
        userId: undefined,
      });
    }
  }, [editingBranch, reset]);

  const onSubmit = async (data: BranchAssignCreateSchemaType) => {
    try {
      if (editingBranch) {
        // Update existing company assignment
        await updateBranchAssign({
          id: editingBranch.id,
          ...data,
        }).unwrap();
        toast.success("Company assignment updated successfully");
      } else {
        // Create new company assignment
        await createBranchAssign(data).unwrap();
        toast.success("Company assignment created successfully");
      }

      // Close modal after successful submission
      onClose();
    } catch (error: any) {
      console.error("Error submitting company assignment:", error);
      toast.error(
        error?.data?.message ||
          `Failed to ${editingBranch ? "update" : "create"} company assignment`
      );
    }
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">
        {/* Branch Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="branchId">Company {requiredStar}</Label>
          <BranchIdDropdown
            value={watch("branchId")}
            onChange={(val) => setValue("branchId", val)}
          />
          {errors.branchId && (
            <p className="text-red-500 text-sm">{errors.branchId.message}</p>
          )}
        </div>

        {/* User Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="userId">User {requiredStar}</Label>
          <Select
            value={watch("userId")?.toString() || ""}
            onValueChange={(val) => setValue("userId", Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user: any) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.employee?.name} ({user.role?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.userId && (
            <p className="text-red-500 text-sm">{errors.userId.message}</p>
          )}
          {users.length === 0 && currentBranchId && (
            <p className="text-yellow-600 text-sm">
              No users found for this branch
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
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
          {editingBranch ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateBranchAssignModel;
