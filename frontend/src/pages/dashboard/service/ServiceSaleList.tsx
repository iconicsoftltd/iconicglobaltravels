import { ReusableTable } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SectionHeader from "@/components/ui/section-header";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

// 1. UPDATED INTERFACE to match the columns in the new image (Service Sale)
interface ServiceSaleType {
    id: number;
    invoice: string;
    date: string;
    customer: string;
    serviceName: string;
    total: number;
    paid: number;
    due: number;
}

const ServiceSaleListPage = () => {
    // State Management
    const [page, setPage] = useState(1); // Set initial page to 0 for correct slice logic
    const [rowsPerPage,] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // 2. MODIFIED STATIC DATA to match the rows in the new image
    const staticData: ServiceSaleType[] = useMemo(
        () => [
            {
                id: 1,
                invoice: "INV/001/000003",
                date: "05-02-2023",
                customer: "Alamgir Islam",
                serviceName: "Mobile Repair",
                total: 100.00,
                paid: 100.00,
                due: 0.00,
            },
            // Adding a second item, slightly modified for variety
            {
                id: 2,
                invoice: "INV/001/000004",
                date: "06-02-2023",
                customer: "Rahim Khan",
                serviceName: "Laptop Service",
                total: 250.00,
                paid: 150.00,
                due: 100.00,
            },
            ...Array.from({ length: 48 }, (_, i) => ({
                id: i + 3,
                invoice: `INV/001/${String(100000 + i).slice(-6)}`,
                date: `0${(i % 12) + 1}-2023`,
                customer: `Customer ${i + 3}`,
                serviceName: i % 2 === 0 ? "PC Tune-up" : "Software Install",
                total: (i + 1) * 50.0,
                paid: (i + 1) * 25.0,
                due: (i + 1) * 25.0,
            })),
        ],
        []
    );

    // Filtered Data (search simulation)
    const filteredData = staticData.filter(
        (item) =>
            item.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.date.includes(searchTerm)
    );

    const totalItems = filteredData.length;
    const paginatedData = filteredData.slice(
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

    // Handle rows per page change
    // const handleRowsPerPageChange = (newRowsPerPage: number) => {
    //     setRowsPerPage(newRowsPerPage);
    //     setPage(0);
    // };

    // 3. MODIFIED COLUMNS to match the new image headers and data fields
    const columns: ColumnDef<ServiceSaleType>[] = [
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
            accessorKey: "invoice",
            header: "Invoice",
        },
        {
            accessorKey: "date",
            header: "Date",
        },
        {
            accessorKey: "customer",
            header: "Customer",
        },
        {
            accessorKey: "serviceName",
            header: "Service Name",
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => (
                <span>{row.original.total.toFixed(2)}</span>
            )
        },
        {
            accessorKey: "paid",
            header: "Paid",
            cell: ({ row }) => (
                <span>{row.original.paid.toFixed(2)}</span>
            )
        },
        {
            accessorKey: "due",
            header: "Due",
            cell: ({ row }) => (
                <span>{row.original.due.toFixed(2)}</span>
            )
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ }) => (
                <div className="flex gap-4 justify-left">
                    {/* The image does not show edit/delete, but based on previous patterns, I'll keep the buttons for common table functionality. */}
                    <Button variant="outline" className="bg-gray-100" size="icon">
                        <FaRegEdit />
                    </Button>
                    <Button variant="outline" className="bg-gray-100 text-red-400" size="icon">
                        <FaTrashAlt />
                    </Button>
                </div>
            ),
        },
    ];

    const [search, setSearch] = useState("");
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setSearchTerm(value);
        setPage(0);
    };


    return (
        <div className="min-h-[83vh] flex flex-col">

            {/* section header  */}
            <div className="mt-[18px] mb-[24px]">
                <SectionHeader
                    title="Service Sale List"
                    searchValue={search}
                    onSearchChange={handleSearchChange}
                    onCreate={() => alert("Create button clicked")}
                />
            </div>

            <div className="flex-1 flex flex-col">
                <ReusableTable
                    data={paginatedData}
                    columns={columns}
                    columnPriority={{
                        actions: 1,
                        due: 2,
                        paid: 3,
                        total: 4,
                        serviceName: 5,
                        customer: 6,
                        date: 7,
                        invoice: 8,
                    }}
                    currentPage={page}
                    itemsPerPage={rowsPerPage}
                    totalItems={totalItems}
                    setCurrentPage={setPage}
                />
            </div>

        </div>
    )
}

export default ServiceSaleListPage;