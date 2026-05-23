import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GrNotes } from "react-icons/gr";

import ButtonLoader from "@/components/loader/ButtonLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requiredStar } from "@/utils/helper/requiredStar";

import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from "@/components/store/api/branch/branchApi";
import { useAddThumbnailMutation } from "@/components/store/api/file/fileApi";

import {
  BranchCreateProps,
  branchCreateSchema,
  branchUpdateSchema,
} from "@/components/schemas/branchSchemas/branchCreateSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BranchType {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
  isActive: boolean;
}

interface CreateBranchModelProps {
  onClose: () => void;
  editingBranch?: BranchType | null;
}

const CreateBranchModel: React.FC<CreateBranchModelProps> = ({
  onClose,
  editingBranch,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [addThumbnail] = useAddThumbnailMutation();
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BranchCreateProps>({
    resolver: zodResolver(
      editingBranch ? branchUpdateSchema : branchCreateSchema
    ),
  });

  /** Initialize form */
  useEffect(() => {
    if (editingBranch) {
      reset({
        name: editingBranch.name,
        address: editingBranch.address,
        email: editingBranch.email,
        phone: editingBranch.phone,
        logo: editingBranch.logo,
        isActive: editingBranch.isActive,
      });
      if (editingBranch.logo) setPreview(editingBranch.logo);
    } else {
      reset({
        name: "",
        address: "",
        email: "",
        phone: "",
        logo: "",
        isActive: true,
      });
      setPreview(null);
    }
  }, [editingBranch, reset]);

  /** File change */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setValue("logo", selectedFile.name);
    setError(null);
  };

  /** Submit */
  const onSubmit = async (data: BranchCreateProps) => {
    try {
      let logoUrl = data.logo || "";

      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadResponse = await addThumbnail(formData).unwrap();
        logoUrl = Array.isArray(uploadResponse?.data)
          ? uploadResponse.data[0]
          : uploadResponse.data;
      }

      const payload = { ...data, logo: logoUrl };

      if (editingBranch) {
        await updateBranch({ id: editingBranch.id, ...payload }).unwrap();
        toast.success("Branch updated successfully");
      } else {
        await createBranch(payload).unwrap();
        toast.success("Branch created successfully");
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message ||
          `Failed to ${editingBranch ? "update" : "create"} branch`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

  {/* SECTION: BASIC INFO */}
  <div className="border-b pb-6">
    <h2 className="text-sm font-semibold text-gray-800 mb-4">
      Basic Information
    </h2>

    <div className="grid sm:grid-cols-2 gap-5">

      {/* Name */}
      <div>
        <Label>Company Name {requiredStar}</Label>
        <Input
          {...register("name")}
          disabled={isLoading}
          placeholder="Enter company name"
          className="mt-2 h-10 rounded-lg"
        />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <Label>Email {requiredStar}</Label>
        <Input
          {...register("email")}
          disabled={isLoading}
          placeholder="Enter email"
          className="mt-2 h-10 rounded-lg"
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <Label>Phone {requiredStar}</Label>
        <Input
          {...register("phone")}
          disabled={isLoading}
          placeholder="Enter phone"
          className="mt-2 h-10 rounded-lg"
        />
        {errors.phone && <p className="error">{errors.phone.message}</p>}
      </div>

      {/* Status */}
      <div>
        <Label>Status {requiredStar}</Label>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={(val) => field.onChange(val === "true")}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-2 h-10 rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

    </div>
  </div>

  {/* SECTION: ADDRESS */}
  <div className="border-b pb-6">
    <h2 className="text-sm font-semibold text-gray-800 mb-4">
      Address
    </h2>

    <Textarea
      {...register("address")}
      rows={4}
      disabled={isLoading}
      placeholder="Enter full address"
      className="rounded-lg"
    />

    {errors.address && <p className="error">{errors.address.message}</p>}
  </div>

  {/* SECTION: LOGO */}
  <div>
    <h2 className="text-sm font-semibold text-gray-800 mb-4">
      Company Logo
    </h2>

    <div className="flex items-center gap-4">

      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center w-32 h-32 
        border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition">
        <span className="text-xs text-gray-400">Upload</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            className="w-24 h-24 rounded-xl object-cover border shadow-sm"
          />

          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setFile(null);
              setValue("logo", "");
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}
    </div>

    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
  </div>

  {/* ACTIONS */}
  <div className="flex justify-end gap-3 pt-4">

    <Button
      type="button"
      onClick={onClose}
      variant="outline"
      disabled={isLoading}
      className="rounded-lg px-5"
    >
      Cancel
    </Button>

    <Button
      type="submit"
      disabled={isLoading}
      className="rounded-lg px-6 flex items-center gap-2"
    >
      {isSubmitting ? <ButtonLoader /> : <GrNotes />}
      {editingBranch ? "Update" : "Create"}
    </Button>

  </div>

</form>
  );
};

export default CreateBranchModel;
