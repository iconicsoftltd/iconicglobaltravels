import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

interface IHeadingProps {
  children: string | ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "tertiary";
  size?: "24" | "20" | "18" | "16" | "14";
  align?: "center" | "start" | "end";
}

const Heading: FC<IHeadingProps> = ({
  children,
  className,
  variant = "primary",
  size = "24",
  align,
}) => {
  return (
    <h2
      className={cn(
        "text-start font-primary_font",
        align === "center" && "text-center",
        align === "start" && "text-start",
        align === "end" && "text-end",
        variant === "primary" &&
          " text-primary text-ellipsis",
        variant === "secondary" &&
          "text-foreground text-ellipsis",
        variant === "tertiary" &&
          " text-foreground/90 text-ellipsis",
        size === "24" &&
          "text-[20px] md:text-[24px] font-[500] leading-7",
        size === "20" &&
          "text-[18px] md:text-[20px] font-[500] leading-7",
        size === "18" &&
          "text-[16px] md:text-[18px] font-[500] leading-7",
        size === "16" &&
          "text-[14px] md:text-[16px] font-[500] leading-7",
        size === "14" &&
          "text-[14px] md:text-[14px] font-[500] leading-7",
        className
      )}
    >
      {children}
    </h2>
  );
};

export default Heading;
