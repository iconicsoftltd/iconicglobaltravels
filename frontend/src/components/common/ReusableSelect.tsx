import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requiredStar } from "@/utils/helper/requiredStar";

interface Option {
  id: string | number;
  label: string;
}

interface ReusableSelectProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: Option[];
  value: string | number | undefined;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

const ReusableSelect: React.FC<ReusableSelectProps> = ({
  label,
  required,
  placeholder = "Select One",
  options,
  value,
  onChange,
  id = "select-input",
  className,
}) => {
  return (
    <div className={` ${className || ""}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && requiredStar}
        </label>
      )}

      <Select
        value={value ? String(value) : ""}
        onValueChange={(val) => onChange(val)}
      >
        <SelectTrigger
          id={id}
          className="border-primary-100 focus:ring-0 focus:border-indigo-500 bg-white [&>span]:text-gray-500"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options available
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ReusableSelect;
