import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API_TAG_TYPES, apiSlice } from "@/components/store/rootApi/apiSlice";
import { selectUser } from "@/components/store/store";
import { useGetBranchAllQuery } from "@/components/store/api/branch/branchApi";

interface IBranch {
  id: number;
  name: string;
  address: string;
}

const BranchSelector = () => {
  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { data: branchesData } = useGetBranchAllQuery({ page: 1, size: 1000 });
  const user = useSelector(selectUser);

  useEffect(() => {
    const savedBranch = localStorage.getItem("selectedBranch");
    if (savedBranch) {
      setSelectedBranch(JSON.parse(savedBranch));
    } else if (branchesData?.data.length > 0) {
      // const userBranch = branchesData?.data.find(
      //   (branch) => branch?.id === user?.branchId
      // );
      const userBranch = branchesData?.data[0]; // Default to first branch if user branch not found
      if (userBranch) {
        setSelectedBranch(userBranch);
        localStorage.setItem("selectedBranch", JSON.stringify(userBranch));
        return;
      }
    }
  }, [branchesData, user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (branch: IBranch) => {
    setSelectedBranch(branch);
    localStorage.setItem("selectedBranch", JSON.stringify(branch));
    dispatch(apiSlice.util.invalidateTags(API_TAG_TYPES));
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        className="flex h-[42px] max-w-[140px] bg-transparent text-left items-center justify-between gap-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-none transition-border disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="line-clamp-1">
          {selectedBranch?.name || "Select Branch"}
        </span>
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute p-1 z-50 mt-1 space-y-1 max-h-60 overflow-auto thin-scrollbar rounded-md min-w-max border bg-popover text-popover-foreground shadow-md">
          {branchesData?.data.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => handleChange(branch)}
              className={`relative flex w-full items-center gap-2 rounded-sm py-1.5 px-2 text-sm transition-colors ${
                branch.id === selectedBranch?.id
                  ? "bg-primary text-white"
                  : "bg-primary-50 hover:bg-primary hover:text-white"
              }`}
            >
              <span>{branch.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
