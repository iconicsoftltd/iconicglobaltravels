import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/components/store/api/user/userApi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetAllRolesQuery } from "@/components/store/api/role/roleApi";
import { useGetAllEmployeesQuery } from "@/components/store/api/employee/employeeApi";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import ButtonLoader from "@/components/loader/ButtonLoader";

// Updated schema with roleId, employeeId, and password
const userCreateSchema = z.object({
  roleId: z.number().min(1, "Role is required"),
  employeeId: z.number().min(1, "Employee is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be at most 16 characters"),
});

const userEditSchema = z.object({
  roleId: z.number().min(1, "Role is required"),
  employeeId: z.number().min(1, "Employee is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must be at most 16 characters")
    .optional()
    .or(z.literal("")),
});

export type UserCreateProps = z.infer<typeof userCreateSchema>;
export type UserEditProps = z.infer<typeof userEditSchema>;

interface UserType {
  id: number;
  employeeId: number;
  password: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    name: string;
  };
  employee: {
    name: string;
  };
}

interface CreateUserModelProps {
  onClose: () => void;
  editingUser?: UserType | null;
  branchId?: number;
}

const CreateUserModel: React.FC<CreateUserModelProps> = ({
  onClose,
  editingUser,
  // branchId: propBranchId,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<UserCreateProps | UserEditProps>({
    resolver: zodResolver(editingUser ? userEditSchema : userCreateSchema),
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  // Fetch roles and employees based on branchId
  const { data: rolesData } = useGetAllRolesQuery({});

  const { data: employeeData } = useGetAllEmployeesQuery({});

  const roles = rolesData?.data || [];
  const employees = employeeData?.data || [];

  // Initialize form with editing data or default values
  useEffect(() => {
    if (editingUser) {
      reset({
        roleId: editingUser.roleId,
        employeeId: editingUser.employeeId,
        password: "", // Don't pre-fill password for security
      });
    } else {
      reset({
        roleId: undefined,
        employeeId: undefined,
        password: "",
      });
    }
  }, [editingUser, reset]);

  // Set employeeId when editing and employees list loaded
  useEffect(() => {
    if (editingUser && employees.length && editingUser.employeeId) {
      const found = employees.find((e) => e.id === editingUser.employeeId);
      if (found) setValue("employeeId", found.id);
    }
  }, [editingUser, employees, setValue]);

  // Set roleId when editing and roles list loaded
  useEffect(() => {
    if (editingUser && roles.length && editingUser.roleId) {
      const found = roles.find((r) => r.id === editingUser.roleId);
      if (found) setValue("roleId", found.id);
    }
  }, [editingUser, roles, setValue]);

  const onSubmit = async (data: UserCreateProps | UserEditProps) => {
    try {
      const payload = {
        roleId: data.roleId,
        employeeId: data.employeeId,
        password: data.password,
      };

      if (editingUser) {
        await updateUser({
          id: editingUser.id,
          ...payload,
        }).unwrap();
        toast.success("User updated successfully");
      } else {
        await createUser(payload).unwrap();
        toast.success("User created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting user:", error);
      toast.error(
        error?.data?.message ||
        `Failed to ${editingUser ? "update" : "create"} user`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  const wachedEmployeeId = watch("employeeId");
  const wachedRoleId = watch("roleId");
  if (editingUser) {
    if (
      !wachedRoleId ||
      !wachedEmployeeId
    ) {
      return;
    }
  }

  return (
    <form autoComplete="off" className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">
        {/* Employee Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="employeeId">Employee {requiredStar}</Label>
          <Select
            value={
              watch("employeeId") !== undefined
                ? String(watch("employeeId"))
                : undefined
            }
            onValueChange={(val) => setValue("employeeId", Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees?.length ? (
                employees.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="0" disabled>
                  No departments found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.employeeId && (
            <p className="text-red-500 text-sm">{errors.employeeId.message}</p>
          )}
          {employees.length === 0 && (
            <p className="text-yellow-600 text-sm">
              No employees found for this branch
            </p>
          )}
        </div>

        {/* Role Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="roleId">Role {requiredStar}</Label>
          <Select
            value={
              watch("roleId") !== undefined
                ? String(watch("roleId"))
                : undefined
            }
            onValueChange={(val) => setValue("roleId", Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.length ? (
                roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="0" disabled>
                  No departments found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.roleId && (
            <p className="text-red-500 text-sm">{errors.roleId.message}</p>
          )}
          {roles.length === 0 && (
            <p className="text-yellow-600 text-sm">
              No roles found for this branch
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password {!editingUser && requiredStar}
            {editingUser && (
              <span className="text-gray-500 text-sm ml-2">
                (Leave blank to keep current password)
              </span>
            )}
          </Label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              autoComplete="new-password"
              {...register("password")}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
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
          {editingUser ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default CreateUserModel;
