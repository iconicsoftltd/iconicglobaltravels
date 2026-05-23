// import { cn } from "@/lib/utils";
// import { FC, ReactNode } from "react";

// interface IParagraphProps {
//   children: string | ReactNode;
//   className?: string;
//   muted?: boolean;
// }

// const Paragraph: FC<IParagraphProps> = ({ children, className, muted }) => {
//   return (
//     <p
//       className={cn(
//         // Base styles
//         "text-sm sm:text-base md:text-lg font-primary_font font-normal text-foreground/90 leading-6 sm:leading-7 md:leading-8 max-w-none truncate",

//         // Muted styles
//         muted && "text-gray-500",

//         // Additional className for overrides
//         className
//       )}
//     >
//       {children}
//     </p>
//   );
// };

// export default Paragraph;


import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { FC, ReactNode } from "react"

const paragraphVariants = cva(
  "font-primary_font font-normal text-foreground/90 max-w-none", // base styles
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        danger: "text-red-600",
        success: "text-green-600",
        info: "text-blue-600",
      },
      size: {
        sm: "text-sm leading-6",
        md: "text-base sm:text-lg leading-7",
        lg: "text-lg sm:text-xl leading-8",
        xl: "text-xl sm:text-2xl leading-9",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      truncate: {
        true: "truncate",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      weight: "normal",
      truncate: false,
    },
  }
)

interface ParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {
  children: ReactNode
}

const Paragraph: FC<ParagraphProps> = ({
  children,
  className,
  variant,
  size,
  weight,
  truncate,
  ...props
}) => {
  return (
    <p
      className={cn(paragraphVariants({ variant, size, weight, truncate }), className)}
      {...props}
    >
      {children}
    </p>
  )
}

export default Paragraph
