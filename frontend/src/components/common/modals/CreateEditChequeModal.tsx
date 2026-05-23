import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

;

import ButtonLoader from "@/components/loader/ButtonLoader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChequeCreateProps, chequeCreateSchema } from "@/schemas/admin/chequeManager/chequeSchema";
import { useCreateChequeMutation, useUpdateChequeMutation } from "@/components/store/api/chequeManager/chequeApi";
import { useGetAllBanksQuery } from "@/components/store/api/chequeManager/bankApi";
import { useGetAllCustomerParticularQuery } from "@/components/store/api/particularAccount/particularAccountApi";

interface ChequeType {
  id: number;
  branchId: number;
  bankId: number;
  customerId: number;
  chequeNumber: string;
  amount: number;
  checkDate: string;
  submitDate: string;
  status?: string;
}

interface CreateEditChequeModalProps {
  onClose: () => void;
  editingCheque?: ChequeType | null;
}

const CreateEditChequeModal: React.FC<CreateEditChequeModalProps> = ({
  onClose,
  editingCheque,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    control,
  } = useForm<ChequeCreateProps>({
    resolver: zodResolver(chequeCreateSchema),
  });

  const [createCheque, { isLoading: isCreating }] = useCreateChequeMutation();
  const [updateCheque, { isLoading: isUpdating }] = useUpdateChequeMutation();

  watch("bankId");
  watch("customerId");

  // Fetch banks for dropdown
  const { data: banksData, isLoading: banksLoading } = useGetAllBanksQuery(
    { page: 1, size: 100, search: ""}
  );

  // Fetch customers for dropdown (assumes existence of customer API)
  const { data: customersData, isLoading: customersLoading } = useGetAllCustomerParticularQuery(
    { page: 1, size: 100, search: ""}
  );

  useEffect(() => {
    if (editingCheque) {
      const editingData = {
        branchId: editingCheque.branchId,
        bankId: editingCheque.bankId,
        customerId: editingCheque.customerId,
        chequeNumber: editingCheque.chequeNumber,
        amount: editingCheque.amount,
        // Convert dates to ISO strings for inputs
        checkDate: editingCheque.checkDate ? new Date(editingCheque.checkDate).toISOString().slice(0, 10) : "",
        submitDate: editingCheque.submitDate ? new Date(editingCheque.submitDate).toISOString().slice(0, 10) : "",
        status: editingCheque.status as any,
      };
      reset(editingData as any);
    } else {
      reset({
        bankId: 0,
        customerId: 0,
        chequeNumber: "",
        amount: 0,
        checkDate: new Date().toISOString().slice(0, 10),
        submitDate: new Date().toISOString().slice(0, 10),
        status: "Pending",
      } as any);
    }
  }, [editingCheque, reset]);

  // Keep selected bank/customer if editing and lists change
  useEffect(() => {
    if (editingCheque && banksData?.data) {
      const bankExists = banksData.data.some((b: any) => b.id === editingCheque.bankId);
      if (bankExists) setValue("bankId", editingCheque.bankId);
      else setValue("bankId", 0);
    }
  }, [banksData, editingCheque, setValue]);

  useEffect(() => {
    if (editingCheque && customersData?.data) {
      const customerExists = customersData.data.some((c: any) => c.id === editingCheque.customerId);
      if (customerExists) setValue("customerId", editingCheque.customerId);
      else setValue("customerId", 0);
    }
  }, [customersData, editingCheque, setValue]);

  const onSubmit = async (data: ChequeCreateProps) => {
    try {
      // The schema transforms checkDate/submitDate to Date objects already
      const payload = {
        bankId: data.bankId,
        customerId: data.customerId,
        chequeNumber: data.chequeNumber,
        amount: data.amount,
        checkDate: data.checkDate,
        submitDate: data.submitDate,
        status: data.status,
      };

      if (editingCheque) {
        await updateCheque({ id: editingCheque.id, data: payload }).unwrap();
        toast.success("Cheque updated successfully");
      } else {
        await createCheque(payload).unwrap();
        toast.success("Cheque created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting cheque:", error);
      toast.error(
        error?.data?.message ||
          `Failed to ${editingCheque ? "update" : "create"} cheque`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 space-y-4">

        {/* Bank Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="bankId">Bank {requiredStar}</Label>
          <Controller
            name="bankId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={isLoading || banksLoading}
              >
                <SelectTrigger id="bankId" className="w-full">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Select a bank</SelectItem>
                  {banksData?.data?.map((bank: any) => (
                    <SelectItem key={bank.id} value={String(bank.id)}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.bankId && <p className="text-red-500 text-sm">{errors.bankId.message}</p>}
        </div>

        {/* Customer Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer {requiredStar}</Label>
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => field.onChange(Number(value))}
                disabled={isLoading || customersLoading}
              >
                <SelectTrigger id="customerId" className="w-full">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Select a customer</SelectItem>
                  {customersData?.data?.map((customer: any) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.accountType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.customerId && <p className="text-red-500 text-sm">{errors.customerId.message}</p>}
        </div>

        {/* Cheque Number */}
        <div className="space-y-2">
          <Label htmlFor="chequeNumber">Cheque Number {requiredStar}</Label>
          <Input
            id="chequeNumber"
            placeholder="Enter cheque number"
            {...register("chequeNumber")}
            disabled={isLoading}
          />
          {errors.chequeNumber && (
            <p className="text-red-500 text-sm">{errors.chequeNumber.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount {requiredStar}</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            {...register("amount", { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
          )}
        </div>

        {/* Check Date */}
        <div className="space-y-2">
          <Label htmlFor="checkDate">Check Date {requiredStar}</Label>
          <Input
            id="checkDate"
            type="date"
            {...register("checkDate")}
            disabled={isLoading}
          />
          {errors.checkDate && (
            <p className="text-red-500 text-sm">{(errors.checkDate as any).message}</p>
          )}
        </div>

        {/* Submit Date */}
        <div className="space-y-2">
          <Label htmlFor="submitDate">Submit Date {requiredStar}</Label>
          <Input
            id="submitDate"
            type="date"
            {...register("submitDate")}
            disabled={isLoading}
          />
          {errors.submitDate && (
            <p className="text-red-500 text-sm">{(errors.submitDate as any).message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || "Pending"}
                onValueChange={(value) => field.onChange(value)}
                disabled={isLoading}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
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
          {editingCheque ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEditChequeModal;
