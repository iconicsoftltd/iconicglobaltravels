import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { ReusableTable } from "@/components/common/ReusableTable";
import DateAndCustomerFilter from "@/components/dashboard/service/DateAndCustomerFilter";


// --- ZOD SCHEMA DEFINITIONS (Unchanged) ---
const ServiceItemSchema = z.object({
    serviceName: z.string().min(1, { message: "Select a service." }),
    quantity: z.coerce.number().min(1, { message: "Min 1" }),
    unitPrice: z.coerce.number().min(0, { message: "Min 0.00" }),
    subTotal: z.coerce.number(),
    id: z.string().optional(),
});

// Update the type to include the ID from useFieldArray's fields
type ServiceItemWithId = z.infer<typeof ServiceItemSchema> & { id: string };

const ServiceSaleSchema = z.object({
    items: z.array(ServiceItemSchema).min(1, { message: "Must have at least one service item." }),
    totalAmount: z.number(),
    paidAmount: z.coerce.number().min(0, { message: "Paid amount is required." }),
    dueAmount: z.number(),
    paymentMode: z.string().min(1, { message: "Payment mode is required." }),
    accountNo: z.string().min(1, { message: "Account is required." }),
    notes: z.string().optional(),
    attachment: z.any().optional(),
});

type ServiceSaleFormValues = z.infer<typeof ServiceSaleSchema>;
type ServiceItemValues = z.infer<typeof ServiceItemSchema>;


// --- Mock Data & Helper Functions (Unchanged) ---
const MOCK_SERVICES = [
    { id: "1", name: "Mobile Repair", price: 150.0 },
    { id: "2", name: "Laptop Diagnostics", price: 75.0 },
    { id: "3", name: "Software Installation", price: 50.0 },
];
const MOCK_PAYMENT_MODES = ["Cash", "Bank Transfer", "Mobile Banking"];
const MOCK_ACCOUNTS = ["Cash Account 001", "Bank A/C 456", "M-Cash 789"];

const calculateTotal = (items: ServiceItemValues[] | undefined) => {
    return (items || []).reduce((acc, item) => {
        const subTotal = (item.quantity || 0) * (item.unitPrice || 0);
        return acc + subTotal;
    }, 0);
};

// --- Form Component ---

const CreateServiceSalePage = () => {
    const defaultValues: ServiceSaleFormValues = {
        items: [
            {
                serviceName: MOCK_SERVICES[0].id,
                quantity: 1,
                unitPrice: MOCK_SERVICES[0].price,
                subTotal: MOCK_SERVICES[0].price * 1,
            },
        ], // Start with ONE item as required
        totalAmount: 0.00,
        paidAmount: 0.00,
        dueAmount: 0.00,
        paymentMode: "",
        accountNo: "",
        notes: "Notes - Relevant information not covered, additional terms and condition",
        attachment: undefined,
    };

    const form = useForm<ServiceSaleFormValues>({
        resolver: zodResolver(ServiceSaleSchema),
        defaultValues,
        mode: "onChange",
    });

    const { control, handleSubmit, reset, setValue, getValues, trigger } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const watchedItems = useWatch({ control, name: "items" });
    const watchedPaidAmount = useWatch({ control, name: "paidAmount" });

    const totalAmount = calculateTotal(watchedItems);
    const dueAmount = totalAmount - (watchedPaidAmount || 0);

    // Update totalAmount and dueAmount in the form state
    useMemo(() => {
        setValue("totalAmount", totalAmount);
        setValue("dueAmount", dueAmount);
    }, [totalAmount, dueAmount, setValue]);


    const onSubmit = (data: ServiceSaleFormValues) => {
        alert(`Total Amount: ${data.totalAmount.toFixed(2)}, Paid: ${data.paidAmount.toFixed(2)}, Due: ${data.dueAmount.toFixed(2)}`);
    };

    const handleServiceChange = (index: number, serviceId: string) => {
        const service = MOCK_SERVICES.find(s => s.id === serviceId);
        if (service) {
            setValue(`items.${index}.unitPrice`, service.price);
            const currentQty = getValues(`items.${index}.quantity`) || 0;
            setValue(`items.${index}.subTotal`, currentQty * service.price);
        } else {
            setValue(`items.${index}.unitPrice`, 0);
            setValue(`items.${index}.subTotal`, 0);
        }
        trigger("items");
    };

    const handleItemChange = (index: number) => {
        const qty = getValues(`items.${index}.quantity`) || 0;
        const price = getValues(`items.${index}.unitPrice`) || 0;
        setValue(`items.${index}.subTotal`, qty * price);
        trigger("items");
    };

    const handleResetRow = (index: number) => {
        setValue(`items.${index}`, {
            serviceName: "",
            quantity: 0,
            unitPrice: 0,
            subTotal: 0,
        });
        trigger("items");
    };

    const handleFormReset = () => {
        reset(defaultValues);
    };

    // --- COLUMN DEFINITION (Using TanStack structure) ---
    const columns: ColumnDef<ServiceItemWithId>[] = useMemo(() => [
        {
            accessorKey: "serviceName",
            header: "Service Name",
            // Use the ColumnDef `cell` to embed the form field
            cell: ({ row }) => {
                const index = row.index;
                // Watch the value for real-time rendering outside of the cell input/select
                const currentValue = watchedItems?.[index]?.serviceName;

                // You must wrap FormField around any shadcn form component
                return (
                    <FormField
                        control={control}
                        name={`items.${index}.serviceName`}
                        render={({ field: selectFieldProps }) => (
                            <FormItem className="space-y-0">
                                <Select
                                    onValueChange={(value) => {
                                        selectFieldProps.onChange(value);
                                        handleServiceChange(index, value);
                                    }}
                                    value={currentValue || selectFieldProps.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select One" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {MOCK_SERVICES.map(service => (
                                            <SelectItem key={service.id} value={service.id}>
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            },
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
            cell: ({ row }) => {
                const index = row.index;
                return (
                    <FormField
                        control={control}
                        name={`items.${index}.quantity`}
                        render={({ field: inputFieldProps }) => (
                            <FormItem className="space-y-0">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...inputFieldProps}
                                        onChange={(e) => {
                                            inputFieldProps.onChange(e);
                                            handleItemChange(index);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                );
            },
        },
        {
            accessorKey: "unitPrice",
            header: "Unit Price",
            cell: ({ row }) => {
                const index = row.index;
                const isServiceSelected = !!getValues(`items.${index}.serviceName`);

                return (
                    <FormField
                        control={control}
                        name={`items.${index}.unitPrice`}
                        render={({ field: inputFieldProps }) => (
                            <FormItem className="space-y-0">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...inputFieldProps}
                                        readOnly={isServiceSelected}
                                        className={cn("bg-gray-50", isServiceSelected && "bg-gray-100")}
                                        onChange={(e) => {
                                            inputFieldProps.onChange(e);
                                            handleItemChange(index);
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                );
            },
        },
        {
            accessorKey: "subTotal",
            header: "Sub Total",
            cell: ({ row }) => {
                const index = row.index;
                const subTotalValue = watchedItems?.[index]?.subTotal.toFixed(2) || '0.00';
                return (
                    <FormField
                        control={control}
                        name={`items.${index}.subTotal`}
                        render={() => (
                            <FormItem className="space-y-0">
                                <FormControl>
                                    <Input
                                        type="text"
                                        value={subTotalValue}
                                        className="text-right bg-gray-100 font-medium"
                                        readOnly
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center">Action</div>,
            cell: ({ row }) => {
                const index = row.index;
                return (
                    <div className="flex justify-center space-x-2">
                        {/* Add Row Button (Only on the last row) */}
                        {(index === fields.length - 1) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => append({ serviceName: "", quantity: 0, unitPrice: 0, subTotal: 0 })}
                                className="h-8 w-8 text-primary"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Reset Row Button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetRow(index)}
                            className="h-8 w-8 text-secondary-foreground"
                        >
                            <RotateCcw className="h-3 w-3" />
                        </Button>

                        {/* Delete Row Button (Can't delete if only one row remains) */}
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="h-8 w-8 text-red-500"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [fields.length, control, watchedItems]);

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");

    const customers = [
        { id: "customer1", label: "Alice Johnson" },
        { id: "customer2", label: "Bob Smith" },
        { id: "customer3", label: "Charlie Brown" },
    ];
    const handleAddCustomer = () => {
        alert("Open add-customer modal here!");
    };
    return (
        <section className="space-y-4">
            <DateAndCustomerFilter
                title="Service Sale Information"
                date={date}
                setDate={setDate}
                customers={customers}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                onAddCustomer={handleAddCustomer}
            />
            
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-lg mx-auto">
                    <ReusableTable
                        data={fields as ServiceItemWithId[]}
                        columns={columns}
                        columnPriority={{
                            actions: 1,
                            serviceName: 2,
                            quantity: 3,
                            unitPrice: 4,
                            subTotal: 5,
                        }}
                        visibleColumnsCount={{
                            smMobile: 5,
                            mobile: 5,
                            tablet: 5,
                        }}
                    />

                    <div className="flex justify-end">
                        <div className="w-full max-w-sm flex items-center justify-between">
                            <label className="font-semibold text-lg">Total Amount</label>
                            <Input
                                readOnly
                                value={totalAmount.toFixed(2)}
                                className="w-1/2 text-right font-bold text-lg bg-indigo-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t">

                        {/* Paid Amount */}
                        <FormField
                            control={control}
                            name="paidAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Paid Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setValue("dueAmount", totalAmount - Number(e.target.value || 0));
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Due Amount (Readonly) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Due Amount</label>
                            <Input
                                readOnly
                                placeholder="0.00"
                                value={dueAmount.toFixed(2)}
                                className="bg-gray-100 font-medium"
                            />
                        </div>

                        {/* Payment Mode */}
                        <FormField
                            control={control}
                            name="paymentMode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Mode *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {MOCK_PAYMENT_MODES.map(mode => (
                                                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Account No */}
                        <FormField
                            control={control}
                            name="accountNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account No *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select One" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {MOCK_ACCOUNTS.map(account => (
                                                <SelectItem key={account} value={account}>{account}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notes - Relevant information not covered, additional terms and condition"
                                            className="resize-none"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Attachment */}
                        <FormField
                            control={control}
                            name="attachment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Attachment</FormLabel>
                                    <div className="text-xs text-gray-500 mb-2">
                                        Upload size of 4 MB, Accepted Format PDF Or JPEG
                                    </div>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            id="attachment"
                                            className="hidden"
                                            onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </FormControl>
                                    <label htmlFor="attachment">
                                        <Button type="button" variant="outline" className="w-full">
                                            Choose file
                                        </Button>
                                    </label>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <Button type="button" variant="outline" onClick={handleFormReset} className="px-6">
                            Cancel
                        </Button>
                        <Button type="submit" className="px-6 bg-primary hover:bg-primary/90">
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
        </section>
    );
};

export default CreateServiceSalePage;