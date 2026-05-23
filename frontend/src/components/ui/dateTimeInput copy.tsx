import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface DateTimeInputProps {
  name: string;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const DateTimeInput = ({ name, register, watch, setValue }: DateTimeInputProps) => {
  const formatForInput = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "";
    
    try {
      // Ensure we have a Date object
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      
      // Return empty string for invalid dates
      if (isNaN(date.getTime())) return "";
      
      // Convert to local datetime string format (YYYY-MM-DDTHH:MM)
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const parseInputValue = (value: string): string => {
    if (!value) return "";
    
    try {
      // Convert local datetime string to ISO string
      const date = new Date(value);
      return isNaN(date.getTime()) ? "" : date.toISOString();
    } catch {
      return "";
    }
  };

  return (
    <input
      type="datetime-local"
      step="1"
      {...register(name, {
        setValueAs: (value: string | Date) => {
          // Convert to ISO string when setting value
          if (value instanceof Date) return value.toISOString();
          if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? "" : date.toISOString();
          }
          return "";
        }
      })}
      value={formatForInput(watch(name))}
      onChange={(e) => {
        const isoString = parseInputValue(e.target.value);
        setValue(name, isoString, { shouldValidate: true });
      }}
      className="border border-gray-500 pl-3 py-1.5 rounded-md text-gray-700 focus:outline-none focus:ring-2"
    />
  );
};

export default DateTimeInput;