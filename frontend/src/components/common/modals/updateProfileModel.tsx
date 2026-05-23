import ButtonLoader from "@/components/loader/ButtonLoader";
import { profileUpdateSchema } from "@/components/schemas/user/profileUpdateSchema";
import { useAddThumbnailMutation } from "@/components/store/api/file/fileApi";
import { useUpdateProfileMutation } from "@/components/store/api/user/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EmployeeData,
  IEmployee,
} from "@/schemas/admin/employee/employeeSchema";
import { requiredStar } from "@/utils/helper/requiredStar";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GrNotes } from "react-icons/gr";

interface CreateStaffEmployeeModelProps {
  onClose: () => void;
  editingEmployee?: IEmployee | null;
}

const UpdateProfileModel: React.FC<CreateStaffEmployeeModelProps> = ({
  onClose,
  editingEmployee,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [addThumbnail, { isLoading: uploading }] = useAddThumbnailMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeData>({
    resolver: zodResolver(profileUpdateSchema),
  });

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
        phone: "",
        address: "",
        nid: "",
        image: "",
      });
    }
  }, [editingEmployee, reset]);

  /** File upload preview logic */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    setFile(selectedFile);
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
    setError(null);
    setValue("image", selectedFile.name);
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
        const result = await updateEmployee({
          id: editingEmployee.id,
          ...payload,
        }).unwrap();
        toast.success(result?.message || "Profile updated successfully");
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to update profile`);
    }
  };

  const isLoading = isUpdating || uploading || isSubmitting;

  return (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

  {/* SECTION: Basic Info */}
  <div className="border-b border-gray-900/10 pb-10">
    <h2 className="text-base font-semibold text-gray-900">
      Employee Information
    </h2>

    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">

      {/* Name */}
      <div className="sm:col-span-3">
        <label className="block text-sm font-medium text-gray-900">
          Name {requiredStar}
        </label>
        <div className="mt-2">
          <Input
            {...register("name")}
            disabled={isLoading}
            placeholder="Enter full name"
            className="block w-full rounded-md px-3 py-2 text-sm text-gray-900
            outline outline-1 -outline-offset-1 outline-gray-300
            placeholder:text-gray-400
            focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
          />
        </div>
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="sm:col-span-3">
        <label className="block text-sm font-medium text-gray-900">
          Phone {requiredStar}
        </label>
        <div className="mt-2">
          <Input
            {...register("phone")}
            disabled={isLoading}
            placeholder="Enter phone number"
            className="block w-full rounded-md px-3 py-2 text-sm text-gray-900
            outline outline-1 -outline-offset-1 outline-gray-300
            placeholder:text-gray-400
            focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
          />
        </div>
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* NID */}
      <div className="sm:col-span-6">
        <label className="block text-sm font-medium text-gray-900">
          NID {requiredStar}
        </label>
        <div className="mt-2">
          <Input
            {...register("nid")}
            disabled={isLoading}
            placeholder="Enter NID number"
            className="block w-full rounded-md px-3 py-2 text-sm text-gray-900
            outline outline-1 -outline-offset-1 outline-gray-300
            placeholder:text-gray-400
            focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
          />
        </div>
        {errors.nid && (
          <p className="mt-2 text-sm text-red-600">{errors.nid.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="sm:col-span-6">
        <label className="block text-sm font-medium text-gray-900">
          Address {requiredStar}
        </label>
        <div className="mt-2">
          <Textarea
            {...register("address")}
            disabled={isLoading}
            placeholder="Enter full address"
            className="block w-full rounded-md px-3 py-2 text-sm text-gray-900
            outline outline-1 -outline-offset-1 outline-gray-300
            placeholder:text-gray-400
            focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 min-h-[100px]"
          />
        </div>
        {errors.address && (
          <p className="mt-2 text-sm text-red-600">
            {errors.address.message}
          </p>
        )}
      </div>

    </div>
  </div>

  {/* SECTION: Image Upload */}
  <div className="border-b border-gray-900/10 pb-10">
    <h2 className="text-base font-semibold text-gray-900">
      Profile Image
    </h2>

    <div className="mt-6 flex items-center gap-6">

      {/* Upload Button */}
      <label className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50">
        Upload Image
        <input
          type="file"
          accept="image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="h-20 w-20 rounded-md object-cover border"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setFile(null);
              setValue("image", "");
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>

    {/* Errors */}
    <div className="mt-3 space-y-1">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {errors.image && (
        <p className="text-sm text-red-600">{errors.image.message}</p>
      )}
    </div>
  </div>

  {/* ACTION BUTTONS */}
  <div className="flex justify-end gap-3">
    <Button
      type="button"
      onClick={onClose}
      disabled={isSubmitting}
      variant="red_outeline"
      className="px-5"
    >
      Cancel
    </Button>

    <Button
      type="submit"
      disabled={isSubmitting}
      className="px-5 flex items-center gap-2"
    >
      {isSubmitting ? <ButtonLoader /> : <GrNotes />}
      {editingEmployee ? "Update" : "Submit"}
    </Button>
  </div>

</form>
  );
};

export default UpdateProfileModel;
