import { ReusableTable } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SectionHeader from "@/components/ui/section-header";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

// 1. UPDATED INTERFACE to match the columns in the new image
interface ServiceType {
    id: number;
    code: string; // Corresponds to 'Code'
    serviceName: string; // Corresponds to 'Service Name'
    price: number; // Corresponds to 'Price'
    details: string; // Corresponds to 'Details'
    status: string; // Corresponds to 'Status'
}

const ServiceInformationListPage = () => {
    // State Management
    const [page, setPage] = useState(1); // Set initial page to 0 for correct slice logic
    const [rowsPerPage,] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // 2. MODIFIED STATIC DATA to match the rows in the new image
    const staticData: ServiceType[] = useMemo(
        () => [
            {
                id: 1,
                code: "SSUN00001",
                serviceName: "Mobile Repair",
                price: 150.00,
                details: "Mobile Repair Functional",
                status: "Active",
            },
            {
                id: 2, // Use ID 2 for the second row, as it's a separate item even if data looks identical
                code: "SSUN00001",
                serviceName: "Mobile Repair",
                price: 150.00,
                details: "Mobile Repair Functional",
                status: "Active",
            },
            ...Array.from({ length: 48 }, (_, i) => ({
                id: i + 3,
                code: `SERV${String(10000 + i).slice(-5)}`,
                serviceName: `Service ${i + 3}`,
                price: (i + 1) * 25.0,
                details: `Details for Service ${i + 3}`,
                status: (i + 3) % 3 === 0 ? "Inactive" : "Active",
            })),
        ],
        []
    );

    // Filtered Data (search simulation)
    const filteredData = staticData.filter(
        (item) =>
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.price.toString().includes(searchTerm)
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
    const columns: ColumnDef<ServiceType>[] = [
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
            accessorKey: "code",
            header: "Code",
        },
        {
            accessorKey: "serviceName",
            header: "Service Name",
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => (
                <span>{row.original.price.toFixed(2)}</span>
            )
        },
        {
            accessorKey: "details",
            header: "Details",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 text-xs font-medium rounded ${row.original.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {row.original.status}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ }) => (
                <div className="flex gap-4 justify-left">
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
                    title="Service Information List"
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
                        status: 2,
                        details: 3,
                        price: 4,
                        serviceName: 5,
                        code: 6,
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

export default ServiceInformationListPage;