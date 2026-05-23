// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import ReusableDatePicker from "@/components/common/ReusableDatePicker";
// import ReusableSelect from "@/components/common/ReusableSelect";
// import { useState } from "react";

// export function DateAndCustomerFilter() {
//     const [date, setDate] = useState<Date | undefined>(new Date());

//     const [selectedCustomer, setSelectedCustomer] = useState<string>("");

//     const customers = [
//         { id: "customer1", label: "Alice Johnson" },
//         { id: "customer2", label: "Bob Smith" },
//         { id: "customer3", label: "Charlie Brown" },
//     ];

//     return (
//         <div className="p-4 bg-white rounded-md mx-auto">
//             <h2 className="text-xl font-semibold text-indigo-700 mb-6">
//                 Service Sale Information
//             </h2>

//             <div className="flex items-center flex-col sm:flex-row gap-4">
//                 <div className="w-full sm:max-w-[374px]">
//                     <ReusableDatePicker
//                         date={date}
//                         setDate={setDate}
//                     />
//                 </div>


//                 <div className="flex items-end gap-2 w-full sm:max-w-[420px]">
//                     <div className="flex-grow">
//                         <ReusableSelect
//                             label="Customer"
//                             required
//                             placeholder="Select a customer"
//                             options={customers}
//                             value={selectedCustomer}
//                             onChange={setSelectedCustomer}
//                         />
//                     </div>
//                     <Button
//                         type="button"
//                         variant="default"
//                         size="icon"
//                         className="w-10 h-10 mt-1 "
//                         aria-label="Add New Customer"
//                     >
//                         <Plus className="h-5 w-5" />
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// }


import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReusableDatePicker from "@/components/common/ReusableDatePicker";
import ReusableSelect from "@/components/common/ReusableSelect";
import React from "react";

interface Option {
    id: string | number;
    label: string;
}

interface ReusableDateAndSelectFilterProps {
    /** Title displayed at the top */
    title?: string;

    /** Date value & setter */
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;

    /** Select options, value, and setter */
    customers: Option[];
    selectedCustomer: string | number | undefined;
    setSelectedCustomer: (value: string) => void;

    /** Optional: Add button click handler */
    onAddCustomer?: () => void;

    /** Optional: custom button label / icon control */
    showAddButton?: boolean;
}

const DateAndCustomerFilter: React.FC<ReusableDateAndSelectFilterProps> = ({
    title = "Filter Information",
    date,
    setDate,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    onAddCustomer,
    showAddButton = true,
}) => {
    return (
        <div className="p-4 bg-white rounded-md shadow-sm mx-auto">
            {title && (
                <h2 className="text-xl font-semibold text-indigo-700 mb-6">{title}</h2>
            )}

            <div className="flex items-center flex-col sm:flex-row gap-4">
                {/* Date Picker */}
                <div className="w-full sm:max-w-[374px]">
                    <ReusableDatePicker date={String(date)} setDate={setDate} />
                </div>

                {/* Select + Add Button */}
                <div className="flex items-end gap-2 w-full sm:max-w-[420px]">
                    <div className="flex-grow">
                        <ReusableSelect
                            label="Customer"
                            required
                            placeholder="Select a customer"
                            options={customers}
                            value={selectedCustomer}
                            onChange={setSelectedCustomer}
                        />
                    </div>

                    {showAddButton && (
                        <Button
                            type="button"
                            variant="default"
                            size="icon"
                            className="w-10 h-10 mt-1"
                            aria-label="Add New Customer"
                            onClick={onAddCustomer}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DateAndCustomerFilter;
