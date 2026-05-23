import { FC } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Heading from "../typography/Heading";

interface SectionHeaderProps {
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  searchValue = "",
  onSearchChange,
  onCreate,
  createLabel = "Create",
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full bg-white p-6 space-y-[20px]",
        className
      )}
    >
      {/* Row 1 — Title */}
      {
        title &&
        <Heading
          variant="primary"
          className=" font-medium whitespace-nowrap"
        >
          {title}
        </Heading>
      }

      {/* Row 2 — Search and Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search box */}
        <div className="relative w-full sm:w-[362px]">
          <Input
            placeholder="Search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {/* Create button */}
        <Button
          onClick={onCreate}
          className=""
        >
          <Plus className="h-4 w-4 mr-1" />
          {createLabel}
        </Button>
      </div>
    </div>
  );
};

export default SectionHeader;
