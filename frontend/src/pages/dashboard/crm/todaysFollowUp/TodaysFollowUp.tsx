import { ReusableTable } from "@/components/common/ReusableTable";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { appConfiguration } from "@/utils/constant/appConfiguration";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FaMailBulk } from "react-icons/fa";
import { FaEarthAfrica, FaLocationArrow, FaPhone } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";

interface TodaysCall {
    id: number;
    customerName: string; 
    leadsStatus: string; 
    leadsSource: string; 
    phone: string; 
    date: string; 
    totalCall: number; 
    totalMeeting: number; 
    assignedUser: string;
}

const TodaysFollowUpPage = () => {
    // State Management
    const [page, setPage] = useState(0); // Set initial page to 0 for correct slice logic
    const [rowsPerPage,] = useState(10);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // MODIFIED STATIC DATA to match the rows and columns in the image
    const staticData: TodaysCall[] = useMemo(
        () => [
            {
                id: 1,
                customerName: "Md. Rasel",
                leadsStatus: "Land Owner",
                leadsSource: "Self",
                phone: "01756456554",
                date: "24-05-2024",
                totalCall: 5,
                totalMeeting: 5,
                assignedUser: "Md. Rasel",
            },
            {
                id: 2,
                customerName: "Md. Rasel",
                leadsStatus: "Land Owner",
                leadsSource: "Self",
                phone: "01756456554",
                date: "24-05-2024",
                totalCall: 5,
                totalMeeting: 5,
                assignedUser: "Md. Rasel",
            },
            {
                id: 3,
                customerName: "Md. Rasel",
                leadsStatus: "Land Owner",
                leadsSource: "Self",
                phone: "01756456554",
                date: "24-05-2024",
                totalCall: 5,
                totalMeeting: 5,
                assignedUser: "Md. Rasel",
            },
            {
                id: 4,
                customerName: "Md. Rasel",
                leadsStatus: "Land Owner",
                leadsSource: "Self",
                phone: "01756456554",
                date: "24-05-2024",
                totalCall: 5,
                totalMeeting: 5,
                assignedUser: "Md. Rasel",
            },
            {
                id: 5,
                customerName: "Md. Rasel",
                leadsStatus: "Land Owner",
                leadsSource: "Self",
                phone: "01756456554",
                date: "24-05-2024",
                totalCall: 5,
                totalMeeting: 5,
                assignedUser: "Md. Rasel",
            },
            // Populating the rest of the 50 items for pagination testing as per original logic
            ...Array.from({ length: 45 }, (_, i) => ({
                id: i + 6,
                customerName: `Customer ${i + 6}`,
                leadsStatus: i % 3 === 0 ? "Follow Up" : "New Lead",
                leadsSource: i % 4 === 0 ? "Web" : "Self",
                phone: `017${String(100000000 + i * 100).slice(-9)}`,
                date: `25-05-2024`,
                totalCall: (i % 5) + 1,
                totalMeeting: (i % 3) + 1,
                assignedUser: `Agent ${i + 1}`,
            })),
        ],
        []
    );

    const totalItems = staticData.length;
    const paginatedData = staticData.slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage
    );

    // Selection Logic
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = paginatedData.map((item) => item.id);
            setSelectedRows(allIds);
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedRows((prev) => [...prev, id]);
        } else {
            setSelectedRows((prev) => prev.filter((item) => item !== id));
        }
    };

    const allSelected =
        paginatedData.length > 0 &&
        paginatedData.every((item) => selectedRows.includes(item.id));

    // UPDATED COLUMNS to match the image
    const columns: ColumnDef<TodaysCall>[] = [
        {
            id: "select",
            header: () => (
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) =>
                        handleSelectAll(checked as boolean)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedRows.includes(row.original.id)}
                    onCheckedChange={(checked) =>
                        handleSelectOne(row.original.id, checked as boolean)
                    }
                    aria-label="Select row"
                />
            ),
        },
        {
            accessorKey: "id",
            header: "SN",
            cell: ({ row }) => row.index + 1 + page * rowsPerPage,
        },
        {
            accessorKey: "customerName",
            header: "Customer Name",
        },
        {
            accessorKey: "leadsStatus",
            header: "Leads Status",
        },
        {
            accessorKey: "leadsSource",
            header: "Leads Source",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "date",
            header: "Date",
        },
        {
            accessorKey: "totalCall",
            header: "Total Call",
        },
        {
            accessorKey: "totalMeeting",
            header: "Total Meeting",
        },
        {
            accessorKey: "assignedUser",
            header: "Assigned User",
        }
    ];


    return (
        <div className="bg-white">

            <Heading className="p-6 border-b border-primary-100">
                Today's Follow-up
            </Heading>

            <div className="items-center text-center border-b  pt-6 px-6 pb-10 border-primary-100 mb-6">
                {/* Logo */}
                <div className="flex justify-center items-center mb-2">
                    <img
                        src={appConfiguration?.logo}
                        alt="logo"
                        className="w-[270px] object-contain"
                    />
                </div>

                {/* Address */}
                <div className="flex justify-center items-center gap-2 text-gray-700 text-base font-medium mb-1">
                    <FaLocationArrow className="text-gray-500" />
                    <span>{appConfiguration?.address}</span>
                </div>

                {/* Email & Phone */}
                <div className="flex flex-wrap justify-center items-center gap-4 text-gray-600 text-sm mb-1">
                    <div className="flex items-center gap-2">
                        <FaMailBulk className="text-gray-500" />
                        <span>{appConfiguration?.email}</span>
                    </div>
                    <span>|</span>
                    <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-500" />
                        <span>{appConfiguration?.phone}</span>
                    </div>
                </div>

                {/* Website */}
                <div className="flex justify-center items-center gap-2 text-gray-600 text-sm">
                    <FaEarthAfrica className="text-gray-500" />
                    <span>{appConfiguration?.website}</span>
                </div>
            </div>

            {/* Header Section */}
            <Heading children="Today's Follow-up" className=" font-semibold text-center mb-[14px]" />

            {/* Voucher Info */}
            <div className="flex justify-between gap-4 text-primary font-bold px-4 mb-[10px] text-[14px]">
                <div>
                    <label className="block">Voucher No: RV-0803202500001</label>
                </div>
                <div>
                    <label className="block">Date: 05-02-2025</label>
                </div>
            </div>
            {/* <div className="flex flex-col"> */}
            <ReusableTable
                data={paginatedData}
                columns={columns}
                columnPriority={{
                    assignedUser: 1,
                    totalMeeting: 2,
                    totalCall: 3,
                    date: 4,
                    phone: 5,
                    leadsSource: 6,
                    leadsStatus: 7,
                    customerName: 8,
                    id: 9,
                }}
                currentPage={page}
                itemsPerPage={rowsPerPage}
                totalItems={totalItems}
                setCurrentPage={setPage}
            />
            {/* </div> */}

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 p-6">
                <Button
                    onClick={() => ""}
                    // onClick={() => printVoucher(voucherData)}
                    className=" rounded-none"
                >
                    <span>Print</span>
                    <GrNotes />
                </Button>
                <Button
                    variant="outline"
                    className="border border-red-300 text-red-500 hover:bg-red-50 px-6 rounded-none"
                >
                    Cancel
                </Button>
            </div>

        </div>
    )
}

export default TodaysFollowUpPage;