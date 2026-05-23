import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { requiredStar } from "@/utils/helper/requiredStar";

interface ReusableDatePickerProps {
  date: string;
  setDate: (string) => void;
  label?: string;
  showLabel?: boolean;
}

const ReusableDatePicker = ({
  date,
  setDate,
  label = "Date",
  showLabel = true,
}: ReusableDatePickerProps) => {
  return (
    <>
      {showLabel && (
        <label
          htmlFor="sale-date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {requiredStar}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-between text-left font-normal text-gray-900",
              "border-primary-100 focus:border-primary-600 focus:ring-indigo-500 bg-white hover:bg-white",
              !date && "text-muted-foreground"
            )}
          >
            {/* Display selected date or placeholder */}
            <span className={!date ? "text-muted-foreground" : "text-inherit"}>
              {date ? format(date, "dd-MM-yyyy") : "Select a date"}
            </span>

            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={new Date(date)}
            onSelect={(newDate) => setDate(newDate)}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ReusableDatePicker;
