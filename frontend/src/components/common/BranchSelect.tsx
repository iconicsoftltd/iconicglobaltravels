import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requiredStar } from "@/utils/helper/requiredStar";

interface BranchSelectProps {
  value: number | null;
  onChange: (branchId: number) => void;
  error?: string;
}

interface Branch {
  id: number;
  name: string;
  address?: string;
}

export const BranchSelect: React.FC<BranchSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);

  // Load branches from cookies
  useEffect(() => {
    const cookieData = Cookies.get("branchesList");
    if (cookieData) {
      try {
        const parsed = JSON.parse(cookieData);
        if (Array.isArray(parsed)) setBranches(parsed);
      } catch (err) {
        console.error("Invalid branchesList cookie:", err);
      }
    }
  }, []);

  // Auto-select first branch if available
  useEffect(() => {
    if (branches.length > 0 && !value) {
      onChange(branches[0].id);
    }
  }, [branches, value, onChange]);

  return (
    <div className="space-y-2">
      <Label>Branch {requiredStar}</Label>
      <Select
        value={value ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          {branches.length ? (
            branches.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="0" disabled>
              No branches found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};
