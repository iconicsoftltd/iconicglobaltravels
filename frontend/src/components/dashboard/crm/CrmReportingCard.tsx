import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LuFileSymlink } from "react-icons/lu";
import { Link } from "react-router-dom";

interface ReportCardProps {
    title: string;
    link: string;
    selectLabel: string;
    selectPlaceholder: string;
    selectOptions: { value: string; label: string }[];
}

const CrmReportingCard: React.FC<ReportCardProps> = ({
    title,
    link,
    selectLabel,
    selectPlaceholder,
    selectOptions,
}) => {
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);


    return (
        <Card className="w-full h-full border-none shadow-none rounded-none p-0">
            <CardHeader className="px-6 py-[16px] bg-primary-50 border border-primary-100">
                <CardTitle className="font-semibold text-primary text-[14px] ">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5 bg-white rounded-none">
                <div className="space-y-2">
                    <Label htmlFor={`${title.replace(/\s/g, '')}-select`} className="text-sm font-medium text-gray-700">{selectLabel} *</Label>
                    <Select value={selectedValue} onValueChange={setSelectedValue}>
                        <SelectTrigger id={`${title.replace(/\s/g, '')}-select`} className="w-full bg-white text-gray-700 h-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder={selectPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {selectOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`${title.replace(/\s/g, '')}-from-date`} className="text-sm font-medium text-gray-700">From Date *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-between text-left font-normal bg-white text-gray-700 h-10 border-gray-300",
                                    !fromDate && "text-muted-foreground"
                                )}
                            >
                                {fromDate ? format(fromDate, "PPP") : <span className="text-gray-500">Select Date</span>}
                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50 text-gray-500" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar
                                mode="single"
                                selected={fromDate}
                                onSelect={setFromDate}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`${title.replace(/\s/g, '')}-to-date`} className="text-sm font-medium text-gray-700">To Date *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-between text-left font-normal bg-white text-gray-700 h-10 border-gray-300",
                                    !toDate && "text-muted-foreground"
                                )}
                            >
                                {toDate ? format(toDate, "PPP") : <span className="text-gray-500">Select Date</span>}
                                <CalendarIcon className="ml-2 h-4 w-4 opacity-50 text-gray-500" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar
                                mode="single"
                                selected={toDate}
                                onSelect={setToDate}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex justify-end pt-2">
                    <Link to={link}>
                        <Button
                            className=""
                        >
                            <LuFileSymlink />
                            Show
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export default CrmReportingCard