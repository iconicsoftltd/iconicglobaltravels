
import { cn } from "@/lib/utils";
import { RiErrorWarningLine } from "react-icons/ri";

type ITextInput = {
  label?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  currentValue: string;
  placeHolder: string;
  className?: string;
  required?: boolean;
  row?: number;
  htmlFor?: string;
  id?: string;
  errorMessage?: string;
};

const TextArea = ({
  label,
  onChange,
  currentValue,
  placeHolder,
  className,
  required,
  errorMessage,
  row,
  id,
}: ITextInput) => {

  const defaultClassValue = `block h-24 px-0 w-full -mt-2 text-sm bg-transparent border-2 border-gray-200 appearance-none rounded-md focus:outline-none focus:ring-0 focus:border-primary-100 peer focus:border-t-1 pl-2 overflow-y-auto scrollbar-none`;
  return (
    <div className="flex flex-col gap-2 relative">
      <label
        htmlFor={id || "input-box"}
       
      >
        {label}
      </label>
      <textarea
        id="text-box"
        className={cn(className, defaultClassValue)}
        value={currentValue}
        onChange={onChange}
        placeholder={placeHolder}
        required={required ?? false}
        rows={row ?? 3}
      />
      {errorMessage ? (
        <div className="text-xs text-red-700 mt-[0.4rem] flex items-center">
          <RiErrorWarningLine className="inline-block h-3 w-3 mr-[0.45rem] self-start mt-[0.1rem]" />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
};

export default TextArea;