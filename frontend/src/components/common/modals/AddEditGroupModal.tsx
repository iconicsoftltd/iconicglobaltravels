import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { requiredStar } from "@/utils/helper/requiredStar";
import {
  GroupData,
  groupSchema,
  IGroup,
} from "@/schemas/admin/group/groupSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import ButtonLoader from "@/components/loader/ButtonLoader";

interface AddEditGroupModelProps {
  onClose: () => void;
  editingGroup?: IGroup | null;
  onCreate?: (data: GroupData) => Promise<any>;
  onUpdate?: (id: number, data: GroupData) => Promise<any>;
}

const AddEditGroupModal: React.FC<AddEditGroupModelProps> = ({
  onClose,
  editingGroup,
  onCreate,
  onUpdate,
}) => {
  const [isReady, setIsReady] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupData>({
    resolver: zodResolver(groupSchema),
  });

  const account = useWatch({ control, name: "account" });
  /** Initialize form */
  useEffect(() => {
    if (editingGroup) {
      const validAccounts = [
        "Assets",
        "Liability",
        "Equity",
        "Income",
        "Expense",
        "Other_Accounts",
      ];
      const normalizedAccount = validAccounts.includes(editingGroup.account)
        ? editingGroup.account
        : "Other_Accounts";

      reset({
        ...editingGroup,
        account: normalizedAccount,
      });
    } else {
      reset({
        account: "Other_Accounts",
        accountType: "",
        code: "",
      });
    }

    // Delay render until reset completes
    setTimeout(() => setIsReady(true), 0);
  }, [editingGroup, reset]);

  /** Submit */
  const onSubmit = async (data: GroupData) => {
    try {
      if (editingGroup && onUpdate) {
        await onUpdate(editingGroup.id, data);
      } else if (onCreate) {
        await onCreate(data);
        toast.success("Group created successfully");
      }
      onClose();
    } catch (err: any) {
      console.error("Error submitting group:", err);
      toast.error(
        err?.data?.message ||
          `Failed to ${editingGroup ? "update" : "create"} group`
      );
    }
  };

  const isLoading = isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Account Select */}
      {isReady && (
        <div className="space-y-2">
          <Label htmlFor="account">Account {requiredStar}</Label>
          <Select
            value={account || ""}
            onValueChange={(v) =>
              setValue("account", v as GroupData["account"])
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Assets",
                "Liability",
                "Equity",
                "Income",
                "Expense",
                "Other_Accounts",
              ].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.account && (
            <p className="text-red-500 text-xs">{errors.account.message}</p>
          )}
        </div>
      )}

      {/* Account Type Input */}
      <div className="space-y-2">
        <Label htmlFor="accountType">Groupt Name {requiredStar}</Label>
        <Input
          id="accountType"
          placeholder="Enter groupt name"
          {...register("accountType")}
          disabled={isLoading}
        />
        {errors.accountType && (
          <p className="text-red-500 text-xs">{errors.accountType.message}</p>
        )}
      </div>

      {/* Code */}
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
          {editingGroup ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditGroupModal;
