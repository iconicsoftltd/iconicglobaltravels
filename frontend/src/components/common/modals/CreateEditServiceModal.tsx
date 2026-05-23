import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { requiredStar } from "@/utils/helper/requiredStar";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

;

import ButtonLoader from "@/components/loader/ButtonLoader";
import { useCreateServiceMutation, useUpdateServiceMutation } from "@/components/store/api/service/serviceApi";
import { CreateEditServiceProps, createEditServiceSchema } from "@/schemas/admin/inventory/service/createEditSchema";
import { removeFalsyValuesProperties } from "@/utils/helper/removeFalsyValuesProperties";

interface ServiceType {
  id: number;
  branchId: number;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEditServiceModalProps {
  onClose: () => void;
  editingService?: ServiceType | null;
}

const CreateEditServiceModal: React.FC<CreateEditServiceModalProps> = ({
  onClose,
  editingService,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateEditServiceProps>({
    resolver: zodResolver(createEditServiceSchema),
  });

  const [createService, { isLoading: isCreating }] =
    useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] =
    useUpdateServiceMutation();

  // Initialize form with editing data or dynamic first branch
  useEffect(() => {
    if (editingService) {
      reset({
        name: editingService.name,
        price: editingService.price,
        description: editingService.description || "",
      });
    } else {
      reset({
        name: "",
        price: 0,
        description: "",
      });
    }
  }, [editingService, reset]);

  const onSubmit = async (data: CreateEditServiceProps) => {
    try {
      const payload = {
        name: data.name,
        price: data.price,
        description: data.description,
      };

      if (editingService) {
        await updateService({
          id: editingService.id,
          ...payload,
        }).unwrap();
        toast.success("Service updated successfully");
      } else {
        const updatedPayload = removeFalsyValuesProperties(payload, [
          "description",
        ]);
        await createService(updatedPayload).unwrap();
        toast.success("Service created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting service:", error);
      toast.error(
        error?.data?.message ||
          `Failed to ${editingService ? "update" : "create"} service`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">

        {/* Service Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Service Name {requiredStar}</Label>
          <Input
            id="name"
            placeholder="Enter service name"
            {...register("name")}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Service Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price {requiredStar}</Label>
          <Input
            id="price"
            type="number"
            placeholder="Enter service price"
            step="0.01"
            min="0"
            {...register("price", { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        {/* Service Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter service description (optional)"
            {...register("description")}
            disabled={isLoading}
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="red_outeline"
          className=""
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className=""
        >
          {isLoading ? <ButtonLoader /> : <GrNotes className="" />}
          {editingService ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEditServiceModal;