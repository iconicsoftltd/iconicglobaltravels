import { Card } from "@/components/ui/card";
import CircularProgress from "./CircularProgress";
import { ArrowDown, ArrowUp } from "lucide-react";
import Heading from "@/components/typography/Heading";
import { cn } from "@/lib/utils";

// --- Custom KPI Card Component ---
interface KpiCardProps {
    title: string;
    value: number;
    change: string;
    percentage: number;
    isPositive: boolean;
    color: string; // Dynamic color for path and percentage text
}

const KpiCard = ({ title, value, change, percentage, isPositive, color }: KpiCardProps) => {
    // Define colors for the 'change' indicator
    const changeTextColor = isPositive ? 'text-green-600' : 'text-red-500';
    const ArrowIcon = isPositive ? ArrowUp : ArrowDown;

    return (
        <Card className="flex-1 p-4 flex  justify-between items-center border-gray-100 rounded-md shadow-lg">
            <div>
                <Heading size="18" children={title} />
                <div className="flex items-start justify-between mt-1">
                    <div className="flex flex-col">
                        {/* Main Value */}
                        <Heading size="20" children={value} />
                        <div className={`flex items-center text-xs mt-1 font-medium ${changeTextColor}`}>
                            <div
                                className={
                                    cn(
                                        "p-1 rounded-full mr-1",
                                        isPositive ? "bg-emerald-500/10" : "bg-red-500/10",
                                    )
                                }
                            >
                                <ArrowIcon  className="h-3 w-3 rotate-45" />
                            </div>
                            <span>{change}</span>
                        </div>
                    </div>

                </div>
            </div>
            {/* Circular Progress Bar */}
            <CircularProgress isPositive={isPositive} percentage={percentage} color={color} />
        </Card>
    );
}

export default KpiCard