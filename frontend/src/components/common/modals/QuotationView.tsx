// import { FileText, Mail, Phone } from "lucide-react";

// // Assuming these component imports are available (Shadcn UI)
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";
// import { appConfiguration } from "@/utils/constant/appConfiguration";

// // --- Mock Data (Based on image_c694e1.png/image_c68967.png) ---

// const MOCK_QUOTATION_DATA = {
//     // Header Information
//     customerName: "Md. Fahrnmdul Islam",
//     relation: "Chairman",
//     serviceId: "S-0909202500001",
//     businessId: "B-0909202500001",
//     module: "M-06",

//     // Company Information
//     companyName: "TECH ELEMENT IT LTD",
//     tagline: "YOUR VISION, OUR TECHNOLOGY",
//     address: "Level, D-15, Lily Pond Center, 3 RK Mission Road, Motijheel, Dhaka-1203, Inside Dhaka, 1203, BD",
//     email: "techelementit@gmail.com",
//     hotline: "+880 1601-590-591",
//     website: "https://techelementit.com/",

//     // Quotation Details
//     quotationNo: "Q-0903202500001",
//     date: "05-02-2025",

//     // Line Items (Only one item in the image)
//     items: [
//         {
//             index: 1,
//             productName: "Rubber solid bar 3mm",
//             capacity: 1,
//             quantity: 1,
//             unitPrice: 60,
//             subTotal: 60,
//         },
//     ],

//     // Totals
//     totalAmount: 60,
//     amountInWords: "Sixty Taka Only",

//     // Notes
//     notes: "Notes - Relevant information not covered, additional terms and condition",

//     // Signature/Authorisation (Placeholders)
//     authorisedBy: "Authorised By",
//     account: "Account",
//     signature: "Signature",
// };

// // --- View Component ---

// const QuotationViewPage = () => {
//     const data = MOCK_QUOTATION_DATA;

//     // Helper component for the information boxes
//     const InfoBox = ({ label, value }: { label: string, value: string }) => (
//         <div className="flex items-center">
//             <div className="w-1/4 min-w-[100px] text-xs font-semibold p-1 border border-r-0 bg-gray-50">{label} :</div>
//             <div className="w-3/4 text-xs font-medium p-1 border">{value}</div>
//         </div>
//     );

//     return (
//         <Card className="mx-auto p-0 shadow-lg">
//             <CardContent className="p-6 md:p-10">

//                 {/* --- HEADER / COMPANY & CUSTOMER INFO BLOCK --- */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-4">

//                     {/* Left Column: Company Info & Logo */}
//                     <div className="md:col-span-2 space-y-2">
//                         <div className="flex items-center space-x-2">
//                             <img className="max-w-[217px] object-contain" src={appConfiguration?.logo} alt="" />
//                         </div>
//                         <p className="text-xs text-gray-700">{data.address}</p>
//                         <div className="flex flex-wrap text-xs text-gray-700 space-x-4">
//                             <span className="flex items-center space-x-1">
//                                 <Mail className="h-3 w-3 text-gray-500" />
//                                 <span>{data.email}</span>
//                             </span>
//                             <span className="flex items-center space-x-1">
//                                 <Phone className="h-3 w-3 text-gray-500" />
//                                 <span>Hotline {data.hotline}</span>
//                             </span>
//                             <span className="text-primary hover:underline cursor-pointer">{data.website}</span>
//                         </div>
//                     </div>

//                     {/* Right Column: Customer & Service Info Boxes */}
//                     <div className="md:col-span-1 space-y-px border">
//                         <InfoBox label="Customer Name" value={data.customerName} />
//                         <InfoBox label="Relation" value={data.relation} />
//                         <InfoBox label="Service Id" value={data.serviceId} />
//                         <InfoBox label="Business Id" value={data.businessId} />
//                         <InfoBox label="Module" value={data.module} />
//                     </div>
//                 </div>

//                 {/* --- QUOTATION TITLE & DETAILS --- */}
//                 <div className="text-center mb-6">
//                     <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Quotation</h2>
//                     <div className="flex justify-between items-center text-sm">
//                         <p className="font-medium">Quotation No. : <span className="text-primary">{data.quotationNo}</span></p>
//                         <p className="font-medium">Date : <span className="text-gray-700">{data.date}</span></p>
//                     </div>
//                 </div>

//                 {/* --- LINE ITEM TABLE --- */}
//                 <div className="mb-6">
//                     <Table className="border rounded-t-lg">
//                         <TableHeader className="bg-primary/5">
//                             <TableRow className="border-b-2 border-primary/20">
//                                 <TableHead className="w-[80px] text-xs font-bold text-primary">Index No.</TableHead>
//                                 <TableHead className="text-xs font-bold text-primary">Product Name</TableHead>
//                                 <TableHead className="w-[100px] text-xs font-bold text-primary text-right">Capacity</TableHead>
//                                 <TableHead className="w-[100px] text-xs font-bold text-primary text-right">Quantity</TableHead>
//                                 <TableHead className="w-[100px] text-xs font-bold text-primary text-right">Unit Price</TableHead>
//                                 <TableHead className="w-[100px] text-xs font-bold text-primary text-right">Sub Total</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>

//                             {data.items.map((item) => (
//                                 <TableRow key={item.index}>
//                                     <TableCell className="text-xs">{item.index}</TableCell>
//                                     <TableCell className="text-xs">{item.productName}</TableCell>
//                                     <TableCell className="text-right p-0">
//                                         <Input readOnly value={item.capacity} className="h-8 border-none text-xs text-right bg-transparent" />
//                                     </TableCell>
//                                     <TableCell className="text-right p-0">
//                                         <Input readOnly value={item.quantity} className="h-8 border-none text-xs text-right bg-transparent" />
//                                     </TableCell>
//                                     <TableCell className="text-right p-0">
//                                         <Input readOnly value={item.unitPrice} className="h-8 border-none text-xs text-right bg-transparent" />
//                                     </TableCell>
//                                     <TableCell className="text-right p-0">
//                                         <Input readOnly value={item.subTotal} className="h-8 border-none text-xs text-right font-medium bg-transparent" />
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>

//                     {/* Total Amount Row */}
//                     <div className="flex justify-end border-x border-b p-0">
//                         <div className="flex w-full md:w-1/3">
//                             <div className="w-2/3 p-2 text-sm font-semibold text-right border-r">Total Amount</div>
//                             <div className="w-1/3 p-0">
//                                 <Input 
//                                     readOnly 
//                                     value={data.totalAmount.toFixed(2)} 
//                                     className="h-10 text-sm font-bold text-right border-none bg-yellow-50/50" 
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* --- AMOUNT IN WORDS & NOTES --- */}
//                 <div className="mb-6 border-y py-3 text-center bg-gray-50 text-sm font-medium italic">
//                     (IN WORD: {data.amountInWords})
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//                     {/* Notes Section */}
//                     <div className="space-y-2">
//                         <h4 className="font-semibold text-sm">Notes</h4>
//                         <div className="p-3 border rounded-md text-xs text-gray-700 h-20">
//                             {data.notes}
//                         </div>
//                     </div>

//                     {/* Placeholder for Signature/Stamp/Terms if needed here */}
//                     <div>
//                         {/* Empty placeholder to align the notes/signature block */}
//                     </div>
//                 </div>

//                 {/* --- SIGNATURE BLOCK --- */}
//                 <div className="flex justify-between text-center pt-8 border-t border-dashed">
//                     <div className="text-sm font-semibold border-t pt-1">{data.authorisedBy}</div>
//                     <div className="text-sm font-semibold border-t pt-1">{data.account}</div>
//                     <div className="text-sm font-semibold border-t pt-1">{data.signature}</div>
//                 </div>

//                 {/* --- ACTION BUTTONS (for Print/Cancel) --- */}
//                 <div className="flex justify-end space-x-4 pt-8">
//                     <Button type="button" variant="secondary" className="px-6 text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
//                         Cancel
//                     </Button>
//                     <Button type="button" className="px-6 bg-primary hover:bg-primary/90">
//                         Print
//                     </Button>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// };

// export default QuotationViewPage;



import {  Mail, Phone } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

// Assuming these component imports are available (Shadcn UI)
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReusableTable } from "@/components/common/ReusableTable";
import { appConfiguration } from "@/utils/constant/appConfiguration";


// --- TYPE DEFINITIONS ---
type QuotationItem = {
    index: number;
    productName: string;
    capacity: number;
    quantity: number;
    unitPrice: number;
    subTotal: number;
};

// --- Mock Data (for the view) ---
const MOCK_QUOTATION_DATA = {
    // ... (rest of the mock data remains the same)
    customerName: "Md. Fahrnmdul Islam",
    relation: "Chairman",
    serviceId: "S-0909202500001",
    businessId: "B-0909202500001",
    module: "M-06",
    companyName: "Iconic Unity Group",
    address: "Level, D-15, Lily Pond Center, 3 RK Mission Road, Motijheel, Dhaka-1203, Inside Dhaka, 1203, BD",
    email: "techelementit@gmail.com",
    hotline: "+880 1601-590-591",
    website: "https://techelementit.com/",
    quotationNo: "Q-0903202500001",
    date: "05-02-2025",
    items: [
        { index: 1, productName: "Rubber solid bar 3mm", capacity: 1, quantity: 1, unitPrice: 60, subTotal: 60 },
        { index: 2, productName: "Select One (Example Product)", capacity: 5, quantity: 2, unitPrice: 100, subTotal: 200 },
    ] as QuotationItem[],
    totalAmount: 260,
    amountInWords: "Two Hundred Sixty Taka Only",
    notes: "Notes - Relevant information not covered, additional terms and condition",
    authorisedBy: "Authorised By",
    account: "Account",
    signature: "Signature",
};


// --- COLUMN DEFINITIONS for ReusableTable ---

const columns: ColumnDef<QuotationItem>[] = [
    {
        accessorKey: "index",
        header: "SN",
        // cell: ({ row }) => row.index + 1,
        cell: ({ row }) => (
            <Input readOnly value={row.index + 1} className="h-full w-full max-w-[98px] border border-primary-100 focus:border-primary-100 bg-[#F2F2F2] py-3" />
        )
    },
    {
        accessorKey: "productName",
        header: "Product Name",
        cell: ({ row }) => (
            <Input readOnly value={row.original.productName} className=" border w-full max-w-[466px] border-primary-100 focus:border-primary-100 bg-[#F2F2F2] py-3" />
        )
    },
    {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => (
            <Input readOnly value={row.original.capacity} className=" border w-full max-w-[206px] border-primary-100 focus:border-primary-100 bg-[#F2F2F2] py-3" />
        )
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
            <Input readOnly value={row.original.quantity} className=" border w-full max-w-[206px] border-primary-100 focus:border-primary-100 bg-[#F2F2F2] py-3" />
        ),
    },
    {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => (
            <Input readOnly value={row.original.unitPrice} className=" border w-full max-w-[206px] border-primary-100 focus:border-primary-100 bg-[#F2F2F2] py-3" />
        ),
        footer: () => (
            <span className=" w-full text-right font-semibold inline-block text-black">
                Total Amount
            </span>
        ),
    },
    {
        accessorKey: "subTotal",
        header: "Sub Total",
        cell: ({ row }) => (
            <Input readOnly value={row.original.subTotal} className=" border w-full max-w-[206px] border-primary-100 focus:border-primary-100 bg-[#F2F2F2] py-3" />
        ),
        footer: ({ table }) => {
            const total = table
                .getCoreRowModel()
                .rows.reduce(
                    (sum, row) => sum + (row.original.subTotal || 0),
                    0
                );

            return (
                <Input
                    readOnly
                    value={total.toFixed(2)}
                    className="border w-full max-w-[206px] border-primary-100 focus:border-primary-100 bg-[#F2F2F2] py-3"
                />
            );
        }
    },
];


// --- View Component ---

const QuotationViewPage = () => {
    const data = MOCK_QUOTATION_DATA;

    // Helper component for the information boxes
    const InfoBox = ({ label, value }: { label: string, value: string }) => (
        <div className="flex items-center">
            <div className="w-1/4 min-w-[100px] text-xs font-semibold p-1 border border-r-0 bg-gray-50">{label} :</div>
            <div className="w-3/4 text-xs font-medium p-1 border">{value}</div>
        </div>
    );

    return (
        <Card className=" mx-auto p-0 shadow-lg">
            <CardContent className="p-6 md:p-10">

                {/* --- HEADER / COMPANY & CUSTOMER INFO BLOCK --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-4">

                    {/* Left Column: Company Info & Logo */}
                    <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center space-x-2">
                            <img className="max-w-[217px] object-contain" src={appConfiguration?.logo} alt="Company Logo" />
                        </div>
                        <p className="text-xs text-gray-700">{data.address}</p>
                        <div className="flex flex-wrap text-xs text-gray-700 space-x-4">
                            <span className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span>{data.email}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span>Hotline {data.hotline}</span>
                            </span>
                            <span className="text-primary hover:underline cursor-pointer">{data.website}</span>
                        </div>
                    </div>

                    {/* Right Column: Customer & Service Info Boxes */}
                    <div className="md:col-span-1 space-y-px">
                        <InfoBox label="Customer Name" value={data.customerName} />
                        <InfoBox label="Relation" value={data.relation} />
                        <InfoBox label="Service Id" value={data.serviceId} />
                        <InfoBox label="Business Id" value={data.businessId} />
                        <InfoBox label="Module" value={data.module} />
                    </div>
                </div>

                {/* --- QUOTATION TITLE & DETAILS --- */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-700">Quotation</h2>
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-medium text-purple-700">Quotation No. : <span className="text-primary font-bold">{data.quotationNo}</span></p>
                        <p className="font-medium text-purple-700">Date : <span className="text-gray-700 font-bold">{data.date}</span></p>
                    </div>
                </div>

                <div className="mb-6 border-t border-l border-r border-purple-200">
                    <ReusableTable
                        data={data.items}
                        columns={columns}
                    />
                </div>

                {/* --- AMOUNT IN WORDS & NOTES --- */}
                <div className="mb-6 border-y py-3 text-center bg-[#F2F2F2] text-sm font-medium italic">
                    (IN WORD: {data.amountInWords})
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Notes Section */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Notes</h4>
                        <div className="p-3 border rounded-md text-xs text-gray-700 h-20">
                            {data.notes}
                        </div>
                    </div>

                    {/* Placeholder for Signature/Stamp/Terms if needed here */}
                    <div>
                        {/* Empty placeholder to align the notes/signature block */}
                    </div>
                </div>

                {/* --- SIGNATURE BLOCK --- */}
                <div className="flex justify-between text-center pt-8 border-t border-dashed">
                    <div className="text-sm font-semibold border-t pt-1">{data.authorisedBy}</div>
                    <div className="text-sm font-semibold border-t pt-1">{data.account}</div>
                    <div className="text-sm font-semibold border-t pt-1">{data.signature}</div>
                </div>

                {/* --- ACTION BUTTONS (for Print/Cancel) --- */}
                <div className="flex justify-end space-x-4 pt-8">
                    <Button type="button" variant="secondary" className="px-6 text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                        Cancel
                    </Button>
                    <Button type="button" className="px-6 bg-primary hover:bg-primary/90">
                        Print
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default QuotationViewPage;