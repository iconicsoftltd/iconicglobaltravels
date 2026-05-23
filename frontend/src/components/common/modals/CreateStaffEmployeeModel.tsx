import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XCircle } from "lucide-react";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect, useState } from "react";
import { useAddThumbnailMutation } from "@/components/store/api/file/fileApi";
import { GrNotes } from "react-icons/gr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeSchema,
  EmployeeData,
  IEmployee,
} from "@/schemas/admin/employee/employeeSchema";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/components/store/api/employee/employeeApi";
import toast from "react-hot-toast";
import { useGetAllDepartmentsQuery } from "@/components/store/api/department/departmentApi";
import { useGetAllDesignationsQuery } from "@/components/store/api/designation/designationApi";

import ButtonLoader from "@/components/loader/ButtonLoader";
import { Textarea } from "@/components/ui/textarea";

interface CreateStaffEmployeeModelProps {
  onClose: () => void;
  editingEmployee?: IEmployee | null;
}

const CreateStaffEmployeeModel: React.FC<CreateStaffEmployeeModelProps> = ({
  onClose,
  editingEmployee,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [addThumbnail, { isLoading: uploading }] = useAddThumbnailMutation();
  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError: setRHFError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeData>({
    resolver: zodResolver(employeeSchema),
  });

  const { data: departmentsData } = useGetAllDepartmentsQuery({});
  const { data: designationsData } = useGetAllDesignationsQuery({});

  /** Initialize form with default branch or editing data */
  useEffect(() => {
    if (editingEmployee) {
      reset({
        ...editingEmployee,
        image: editingEmployee.image || "",
      });
      if (editingEmployee.image) setPreview(editingEmployee.image);
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        nid: "",
        salary: 0,
        joiningDate: "",
        departmentId: 0,
        designationId: 0,
        image: "",
      });
    }
  }, [editingEmployee, reset]);

  useEffect(() => {
    if (
      editingEmployee &&
      departmentsData?.data?.length &&
      editingEmployee.departmentId
    ) {
      const found = departmentsData.data.find(
        (d) => d.id === editingEmployee.departmentId
      );
      if (found) setValue("departmentId", found.id);
    }
  }, [departmentsData, editingEmployee, setValue]);

  useEffect(() => {
    if (
      editingEmployee &&
      designationsData?.data?.length &&
      editingEmployee.designationId
    ) {
      const found = designationsData.data.find(
        (d) => d.id === editingEmployee.designationId
      );
      if (found) setValue("designationId", found.id);
    }
  }, [designationsData, editingEmployee, setValue]);

  /** File upload preview logic */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Not an image
    if (!selectedFile.type.startsWith("image/")) {
      setRHFError("image", {
        type: "manual",
        message: "Please upload a valid image file",
      });
      return;
    }

    // Image size > 5MB
    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setRHFError("image", {
        type: "manual",
        message: "Image size must be less than 5 MB",
      });
      return;
    }

    // Valid image
    clearErrors("image");
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setValue("image", selectedFile.name, { shouldValidate: true });
  };

  /** Submit / Update Employee */
  const onSubmit = async (data: EmployeeData) => {
    try {
      let imageUrl = data.image || "";

      // If no preview and no new file => throw validation
      if (!file && !preview) {
        toast.error("Employee image is required");
        return;
      }

      // Upload image if new file is selected
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        const uploadResponse = await addThumbnail(formData).unwrap();
        if (uploadResponse?.data) {
          imageUrl = Array.isArray(uploadResponse.data)
            ? uploadResponse.data[0]
            : uploadResponse.data;
        }
      }

      const payload = { ...data, image: imageUrl };

      if (editingEmployee) {
        await updateEmployee({ id: editingEmployee.id, ...payload }).unwrap();
        toast.success("Employee updated successfully");
      } else {
        await createEmployee(payload).unwrap();
        toast.success("Employee created successfully");
      }

      onClose();
    } catch (err: any) {
      console.error("Error submitting employee:", err);
      toast.error(
        err?.data?.message ||
        `Failed to ${editingEmployee ? "update" : "create"} employee`
      );
    }
  };

  const isLoading = isCreating || isUpdating || uploading || isSubmitting;

  const designationId = watch("designationId")

  if (editingEmployee) {
    if (!designationId) {
      return
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "name", label: "Name" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
        ].map(({ name, label }) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {requiredStar}
            </Label>
            <Input
              id={name}
              placeholder={`Enter ${label.toLowerCase()}`}
              {...register(name as keyof EmployeeData)}
              disabled={isLoading}
            />
            {errors[name as keyof EmployeeData] && (
              <p className="text-red-500 text-xs">
                {errors[name as keyof EmployeeData]?.message as string}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Department & Designation & NID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Department */}
        <div className="space-y-2">
          <Label>Department {requiredStar}</Label>
          <Select
            value={watch("departmentId") ? String(watch("departmentId")) : ""}
            onValueChange={(v) => setValue("departmentId", Number(v))}
            disabled={!departmentsData?.data?.length || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departmentsData?.data?.length ? (
                departmentsData.data.map((d) => (
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
          {errors.departmentId && (
            <p className="text-red-500 text-xs">
              {errors.departmentId.message}
            </p>
          )}
        </div>

        {/* Designation */}
        <div className="space-y-2">
          <Label>Designation {requiredStar}</Label>
          <Select
            value={watch("designationId") ? String(watch("designationId")) : ""}
            onValueChange={(v) => setValue("designationId", Number(v))}
            disabled={!designationsData?.data?.length || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent>
              {designationsData?.data?.length ? (
                designationsData.data.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="0" disabled>
                  No designations found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.designationId && (
            <p className="text-red-500 text-xs">
              {errors.designationId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nid">NID {requiredStar}</Label>
          <Input
            id="nid"
            placeholder="Enter NID"
            {...register("nid")}
            disabled={isLoading}
          />
          {errors.nid && (
            <p className="text-red-500 text-xs">{errors.nid.message}</p>
          )}
        </div>
      </div>

      {/* Address & Other Fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address {requiredStar}</Label>
          <Textarea
            id="address"
            placeholder="Enter address"
            {...register("address")}
            disabled={isLoading}
          />
          {errors.address && (
            <p className="text-red-500 text-xs">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">Salary {requiredStar}</Label>
          <Input
            id="salary"
            type="number"
            {...register("salary")}
            placeholder="Enter salary"
            disabled={isLoading}
          />
          {errors.salary && (
            <p className="text-red-500 text-xs">{errors.salary.message}</p>
          )}
        </div>

        <div className="space-y-2 min-w-[150px]">
          <Label htmlFor="joiningDate">Joining Date {requiredStar}</Label>
          <Input
            id="joiningDate"
            type="date"
            {...register("joiningDate")}
            disabled={isLoading}
          />
          {errors.joiningDate && (
            <p className="text-red-500 text-xs">{errors.joiningDate.message}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <Label>Employee Image (JPEG only) {requiredStar}</Label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/jpeg"
            onChange={handleFileChange}
            className="block text-sm text-gray-500 
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
            disabled={isLoading}
          />

          {preview && (
            <div className="relative w-20 h-20 border rounded-md overflow-hidden mt-2">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                  setValue("image", "");
                }}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        {errors.image && (
          <p className="text-red-500 text-xs">{errors.image.message}</p>
        )}
      </div>

      {/* Buttons */}
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
          {editingEmployee ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default CreateStaffEmployeeModel;
