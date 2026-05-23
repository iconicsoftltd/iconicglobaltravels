import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GrNotes } from "react-icons/gr";
import { requiredStar } from "@/utils/helper/requiredStar";
import {
  ledgerSchema,
  LedgerData,
  ILedger,
} from "@/schemas/admin/ledger/ledgerSchema";
import { useGetAllGroupsQuery } from "@/components/store/api/group/groupApi";
import ButtonLoader from "@/components/loader/ButtonLoader";

interface AddEditLedgerModalProps {
  onClose: () => void;
  editingLedger?: ILedger | null;
  onCreate?: (data: LedgerData) => Promise<any>;
  onUpdate?: (id: number, data: LedgerData) => Promise<any>;
}

const accountEnum = ["Assets", "Liability", "Equity", "Income", "Expense", "Other_Accounts"] as const;

const AddEditLedgerModal: React.FC<AddEditLedgerModalProps> = ({
  onClose,
  editingLedger,
  onCreate,
  onUpdate,
}) => {
  const [filterAccount, setFilterAccount] = useState<string | "">("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LedgerData>({
    resolver: zodResolver(ledgerSchema),
  });

  /** Fetch all group accounts */
  const { data: groupData, isLoading: isGroupLoading } = useGetAllGroupsQuery(
    { page: 1, size: 1000 },
  );

  const groups = groupData?.data ?? [];

  /** Filtered groups based on account filter */
  const filteredGroups = filterAccount
    ? groups.filter((g) => g.account === filterAccount)
    : groups;

  /** Initialize form */
  useEffect(() => {
    if (editingLedger) {
      reset({ ...editingLedger });
      if (editingLedger.group?.account) {
        setFilterAccount(editingLedger.group.account);
      }
    } else {
      reset({
        groupAccountId: 0,
        ledgerType: "",
        code: "",
        isActive: true,
      });
    }
  }, [editingLedger, reset, groupData]);

  /** Submit */
  const onSubmit = async (data: LedgerData) => {
    try {
      if (editingLedger && onUpdate) {
        await onUpdate(editingLedger.id, data);
      } else if (onCreate) {
        await onCreate(data);
      }
      onClose();
    } catch (err: any) {
      console.error("Error submitting ledger:", err);
      toast.error(
        err?.data?.message ||
        `Failed to ${editingLedger ? "update" : "create"} ledger`
      );
    }
  };

  const isLoading = isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Account Type Filter (not part of form submit) */}
      <div className="space-y-2">
        <Label>Account {requiredStar}</Label>
        <Select
          value={filterAccount}
          onValueChange={(val) => setFilterAccount(val)}
          disabled={isLoading || isGroupLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            {accountEnum.map((acc) => (
              <SelectItem key={acc} value={acc}>
                {acc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Group Account Select */}
      <Controller
        control={control}
        name="groupAccountId"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="groupAccountId">
              Group Account {requiredStar}
            </Label>
            <Select
              value={field.value ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(Number(val))}
              disabled={isLoading || isGroupLoading || !filterAccount}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isGroupLoading
                      ? "Loading..."
                      : !filterAccount
                        ? "Select account type first"
                        : "Select group account"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredGroups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.account} — {group.accountType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.groupAccountId && (
              <p className="text-red-500 text-xs">
                {errors.groupAccountId.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Ledger Type */}
      <div className="space-y-2">
        <Label htmlFor="ledgerType">Ledger Name {requiredStar}</Label>
        <Input
          id="ledgerType"
          placeholder="Enter ledger name"
          {...register("ledgerType")}
          disabled={isLoading}
        />
        {errors.ledgerType && (
          <p className="text-red-500 text-xs">{errors.ledgerType.message}</p>
        )}
      </div>

      {/* Code (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          placeholder="Enter code (optional)"
          {...register("code")}
          disabled={isLoading}
        />
        {errors.code && (
          <p className="text-red-500 text-xs">{errors.code.message}</p>
        )}
      </div>

      {/* Active/Inactive Toggle */}
      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select
              value={field.value ? "true" : "false"}
              onValueChange={(val) => field.onChange(val === "true")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />

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
          {editingLedger ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditLedgerModal;
