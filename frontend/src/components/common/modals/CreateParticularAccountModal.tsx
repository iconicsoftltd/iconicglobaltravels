import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requiredStar } from "@/utils/helper/requiredStar";
import { useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
;


import {
  particularAccountCreateSchema,
  ParticularAccountCreateSchema,
} from "@/components/schemas/particularSchemas/particularAccountSchema";
import {
  useCreateParticularMutation,
  useUpdateParticularMutation,
} from "@/components/store/api/particularAccount/particularAccountApi";
import { useGetAllLedgersQuery } from "@/components/store/api/ledger/ledgerApi";
import { removeFalsyValuesProperties } from "@/utils/helper/removeFalsyValuesProperties";
import ButtonLoader from "@/components/loader/ButtonLoader";

interface ParticularAccountType {
  id: number;
  branchId: number;
  ledgerId: number;
  type: "Debit" | "Credit";
  balance: number;
  openingBalance: number;
  openingBalanceType: "Debit" | "Credit";
  openingBalanceDate: string;
  companyName: string | null;
  accountType: string;
  mobileNumber: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  ledger: {
    id: number;
    branchId: number;
    groupAccountId: number;
    ledgerType: string;
    code: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    group: {
      id: number;
      branchId: number;
      account: string;
      accountType: string;
      code: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface CreateParticularAccountModalProps {
  onClose: () => void;
  editingParticular?: ParticularAccountType | null;
}

const CreateParticularAccountModal: React.FC<
  CreateParticularAccountModalProps
> = ({ onClose, editingParticular }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ParticularAccountCreateSchema>({
    resolver: zodResolver(particularAccountCreateSchema),
  });

  const [createParticular, { isLoading: isCreating }] =
    useCreateParticularMutation();
  const [updateParticular, { isLoading: isUpdating }] =
    useUpdateParticularMutation();

  const [ledgers, setLedgers] = useState<any[]>([]);

  // Fetch ledgers based on branchId
  const { data: ledgersData, isLoading: isLoadingLedgers } =

    useGetAllLedgersQuery({size:500});



  // Load ledgers
  useEffect(() => {
    if (ledgersData?.data) {
      setLedgers(ledgersData.data);
    }
  }, [ledgersData]);

  // Initialize form with editing data or defaults
  useEffect(() => {
    if (editingParticular) {
      reset({
        ledgerId: editingParticular.ledgerId,
        type: editingParticular.type,
        openingBalance: editingParticular.openingBalance,
        openingBalanceDate: editingParticular.openingBalanceDate.split("T")[0],
        companyName: editingParticular.companyName || "",
        accountType: editingParticular.accountType,
        mobileNumber: editingParticular.mobileNumber || "",
        email: editingParticular.email || "",
        address: editingParticular.address || "",
      });

      // Ensure Selects sync after reset
      setValue("ledgerId", editingParticular.ledgerId);
      setValue("type", editingParticular.type);
    } else {
      reset({
        ledgerId: 0,
        type: "Debit",
        openingBalance: 0,
        openingBalanceDate: new Date().toISOString().split("T")[0],
        companyName: "",
        accountType: "",
        mobileNumber: "",
        email: "",
        address: "",
      });

      // Select first ledger automatically when available
      if (ledgers.length > 0) {
        setValue("ledgerId", ledgers[0].id);
      }
    }
  }, [editingParticular, ledgers, reset, setValue]);

  // Automatically select first ledger if available
  useEffect(() => {
    if (!editingParticular && ledgers.length > 0) {
      const currentLedger = watch("ledgerId");
      if (!currentLedger || currentLedger === 0) {
        setValue("ledgerId", ledgers[0].id);
      }
    }
  }, [ledgers, editingParticular, watch, setValue]);

  const onSubmit = async (data: ParticularAccountCreateSchema) => {
    try {
      const payload = {
        ...data,
        openingBalance: Number(data.openingBalance),
        openingBalanceDate: data.openingBalanceDate
          ? new Date(data.openingBalanceDate).toISOString()
          : new Date().toISOString(),
      };

      const updateParticularPayload = removeFalsyValuesProperties(payload, [
        "address",
        "email",
        "companyName",
        "mobileNumber",
      ]);

      if (editingParticular) {
        await updateParticular({
          id: editingParticular.id,
          ...updateParticularPayload,
        }).unwrap();
        toast.success("Particular account updated successfully");
      } else {
        const updatePayload = removeFalsyValuesProperties(payload, [
          "address",
          "email",
          "companyName",
          "mobileNumber",
        ]);
        await createParticular(updatePayload).unwrap();
        toast.success("Particular account created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting particular account:", error);
      toast.error(
        error?.data?.message ||
          `Failed to ${
            editingParticular ? "update" : "create"
          } particular account`
      );
    }
  };

  const isLoading = isCreating || isUpdating || isSubmitting;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Ledger Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="ledgerId">Ledger {requiredStar}</Label>
            <Select
              value={watch("ledgerId")?.toString() || ""}
              onValueChange={(val) => setValue("ledgerId", Number(val))}
              disabled={isLoading || isLoadingLedgers}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ledger" />
              </SelectTrigger>
              <SelectContent>
                {ledgers.map((ledger) => (
                  <SelectItem key={ledger.id} value={ledger.id.toString()}>
                    {ledger.ledgerType} {ledger?.code && `(${ledger.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ledgerId && (
              <p className="text-red-500 text-sm">{errors.ledgerId.message}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Name {requiredStar}</Label>
            <Input
              id="accountType"
              placeholder="Enter account name"
              {...register("accountType")}
              disabled={isLoading}
            />
            {errors.accountType && (
              <p className="text-red-500 text-sm">
                {errors.accountType.message}
              </p>
            )}
          </div>

          {/* Type (Debit/Credit) */}
          <div className="space-y-2">
            <Label htmlFor="type">Type {requiredStar}</Label>
            <Select
              value={watch("type")}
              onValueChange={(val: "Debit" | "Credit") => setValue("type", val)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Debit">Debit</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* Opening Balance */}
          <div className="space-y-2">
            <Label htmlFor="openingBalance">
              Opening Balance {requiredStar}
            </Label>
            <Input
              id="openingBalance"
              type="number"
              step="0.01"
              placeholder="Enter opening balance"
              {...register("openingBalance", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.openingBalance && (
              <p className="text-red-500 text-sm">
                {errors.openingBalance.message}
              </p>
            )}
          </div>

          {/* Opening Balance Date */}
          <div className="space-y-2">
            <Label htmlFor="openingBalanceDate">Opening Balance Date</Label>
            <Input
              id="openingBalanceDate"
              type="date"
              {...register("openingBalanceDate")}
              disabled={isLoading}
            />
            {errors.openingBalanceDate && (
              <p className="text-red-500 text-sm">
                {errors.openingBalanceDate.message}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              {...register("companyName")}
              disabled={isLoading}
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              placeholder="Enter mobile number"
              {...register("mobileNumber")}
              disabled={isLoading}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-sm">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter address"
            {...register("address")}
            disabled={isLoading}
            rows={3}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
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
            {editingParticular ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateParticularAccountModal;
