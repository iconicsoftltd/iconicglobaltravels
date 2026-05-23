import { RootState } from "@/components/store/store";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";

interface IDashboardCard {
  title: string;
  value: string | number;
  icon: any;
  className?: string;
}

const DashboardCard = ({ title, value, icon, className }: IDashboardCard) => {
  const currentCurrency = useSelector(
    (state: RootState) => state?.currencies?.currentCurrency,
  );

  const formattedValue = Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Card
      className={cn(
        "rounded-2xl bg-white border border-gray-100 shadow-sm p-5 2xl:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 
          flex items-center justify-center 
          group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {icon}
          </svg>
        </div>

        {/* Content */}
        <div className="text-right space-y-1">
          <p className="text-sm  font-medium">{title}</p>

          <p className="text-2xl font-bold tracking-tight">
            {currentCurrency?.symbol}
            {formattedValue}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DashboardCard;
