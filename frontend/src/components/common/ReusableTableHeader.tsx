import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import Heading from "../typography/Heading";

interface ReusableTableHeaderProps {
  title: string;
  modalTitle?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchReset?: () => void;
  hasCreatePermission?: boolean;
  isModalOpen?: boolean;
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onModalClose?: () => void;
  modalContent?: React.ReactNode;
  createButtonLabel?: string;
  createButtonIcon?: React.ReactNode;
  searchPlaceholder?: string;
  colorClass?: string;
  createButtonLink?: string;
  modalWidthCls?: string;
  modalHeightCls?: string;
}

const ReusableTableHeader: React.FC<ReusableTableHeaderProps> = ({
  title,
  modalTitle,
  searchTerm,
  onSearchChange,
  onSearchReset,
  hasCreatePermission = true,
  isModalOpen,
  setIsModalOpen,
  onModalClose,
  modalContent,
  createButtonLabel = "Create",
  createButtonIcon,
  searchPlaceholder = "Search...",
  colorClass = "text-[#5e48d8]",
  createButtonLink,
  modalWidthCls,
  modalHeightCls,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 
      bg-white/70 backdrop-blur-md border border-gray-100 rounded p-5 shadow-sm">

      {/* LEFT */}
      <div className="flex flex-col gap-3 w-full md:w-auto">

        {/* Title */}
        <Heading className={`text-lg font-semibold ${colorClass}`}>
          {title}
        </Heading>

        {/* Search */}
        <div className="relative w-full md:min-w-[320px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

          <Input
            autoComplete="off"
            name="search_input_x123"
            placeholder={searchPlaceholder}
            value={searchTerm}
            type="text"
            onChange={(e) => {
              onSearchChange(e.target.value);
              onSearchReset?.();
            }}
            className="pl-9 h-10 rounded border-gray-200 
            focus:border-primary focus:ring-2 focus:ring-primary/20 
            text-sm"
          />
        </div>
      </div>

      {/* RIGHT */}
      {hasCreatePermission && (
        <div className="flex items-center gap-2">

          {createButtonLink ? (
            <Link to={createButtonLink}>
              <Button className="rounded px-5 flex items-center gap-2">
                {createButtonIcon}
                {createButtonLabel}
              </Button>
            </Link>
          ) : (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={onModalClose}
                  className="rounded px-5 flex items-center gap-2 shadow-sm"
                >
                  {createButtonIcon}
                  {createButtonLabel}
                </Button>
              </DialogTrigger>

              <DialogContent
                className={`${modalWidthCls || "sm:max-w-[640px]"} 
                ${modalHeightCls || "max-h-[90vh]"} 
                w-[96vw] rounded overflow-y-auto`}
              >
                <DialogHeader>
                  <Heading className={`${colorClass} text-lg font-semibold`}>
                    {modalTitle}
                  </Heading>
                </DialogHeader>

                <div className="border-t my-3" />

                <div className="pt-2">{modalContent}</div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default ReusableTableHeader;