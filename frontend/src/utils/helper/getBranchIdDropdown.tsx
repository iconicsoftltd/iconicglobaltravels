import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBranchAllQuery } from "@/components/store/api/branch/branchApi";

type Branch = {
  id: number;
  name: string;
  address?: string;
};

interface BranchIdDropdownProps {
  value?: number;
  onChange: (value: number) => void;
}

const BranchIdDropdown = ({ value, onChange }: BranchIdDropdownProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const { data: branchesData } = useGetBranchAllQuery({ page: 1, size: 1000 });

  useEffect(() => {
    // const branchCookie = Cookies.get("branchesList");
    // if (branchCookie) {
    //   try {
    //     const parsedBranches: Branch[] = JSON.parse(branchCookie);
    //     setBranches(parsedBranches);

    //     // Automatically select the first branch if none selected
    //     if (!value && parsedBranches.length > 0) {
    //       onChange(parsedBranches[0].id);
    //     }
    //   } catch (error) {
    //     console.error("Error parsing branchesList cookie", error);
    //   }
    // }
    if (branchesData?.data) {
      try {
        const parsedBranches: Branch[] = branchesData?.data;
        setBranches(parsedBranches);

        // Automatically select the first branch if none selected
        if (!value && parsedBranches.length > 0) {
          onChange(parsedBranches[0].id);
        }
      } catch (error) {
        console.error("Error parsing branchesList cookie", error);
      }
    }
  }, [value, onChange]);

  return (
    <Select
      value={value?.toString() ?? ""}
      onValueChange={(val) => onChange(Number(val))}
    >
      <SelectTrigger className="w-full ">
        <SelectValue placeholder="Select Branch" />
      </SelectTrigger>
      <SelectContent>

        {branches.length > 0 ? (
          branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id.toString()}>
              {branch.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="" disabled>
            No branches available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default BranchIdDropdown;
