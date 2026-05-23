import { ReusableTable } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SectionHeader from "@/components/ui/section-header";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { LuPhoneCall } from "react-icons/lu";
import { Link } from "react-router-dom";

// UPDATED INTERFACE to match the columns in the new image
interface TodaysCall {
    id: number;
    profession: string; // Corresponds to 'Profession'
    customerName: string; // Corresponds to 'Customer Name'
    leadsStatus: string; // Corresponds to 'Leads Status'
    leadsSource: string; // Corresponds to 'Leads Source'
    phone: string; // Corresponds to 'Phone'
    projectName: string; // Corresponds to 'Project Name'
    date: string; // Corresponds to 'Date'
    assignTo: string; // Corresponds to 'Assign To'
}

const PendingCallListPage = () => {
    // State Management
    const [page, setPage] = useState(0); // Set initial page to 0 for correct slice logic
    const [rowsPerPage, ] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // MODIFIED STATIC DATA to match the rows in the new image
    const staticData: TodaysCall[] = useMemo(
        () => [
            {
                id: 1,
                profession: "Gvt. Service",
                customerName: "Md. Rasel",
                leadsStatus: "Land Owner",
                leadsSource: "Self",
                phone: "01756456554",
                projectName: "RBL Head Office",
                date: "24-05-2024",
                assignTo: "Md. Rasel",
            },
            {
                id: 2,
                profession: "Gvt. Service",
                customerName: "Md. Rasel",
                leadsStatus: "Land Owner",
                leadsSource: "Self",
                phone: "01756456554",
                projectName: "RBL Head Office",
                date: "24-05-2024",
                assignTo: "Md. Rasel",
            },
            ...Array.from({ length: 48 }, (_, i) => ({
                id: i + 3,
                profession: i % 2 === 0 ? "Business" : "Service",
                customerName: `Customer ${i + 3}`,
                leadsStatus: i % 3 === 0 ? "Follow Up" : "New Lead",
                leadsSource: i % 4 === 0 ? "Web" : "Self",
                phone: `017${String(100000000 + i * 100).slice(-9)}`,
                projectName: `Project Alpha ${i + 3}`,
                date: `25-05-2024`,
                assignTo: `Agent ${i + 1}`,
            })),
        ],
        []
    );

    // Filtered Data (search simulation)
    const filteredData = staticData.filter(
        (item) =>
            item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone.includes(searchTerm) ||
            item.projectName.toLowerCase().includes(searchTerm.toLowerCase())
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
            accessorKey: "profession",
            header: "Profession",
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
            accessorKey: "projectName",
            header: "Project Name",
        },
        {
            accessorKey: "date",
            header: "Date",
        },
        {
            accessorKey: "assignTo",
            header: "Assign To",
        },
        {
            id: "actions",
            header: "Action",
            cell: () => (
                <div className="flex gap-2 justify-left">
                    <Link to={`${1}`}>
                        <Button variant="outline" className="bg-gray-100" size="icon">
                            {/* First action icon based on the image (looks like an assign/view/details icon) */}
                            <LuPhoneCall />
                        </Button>
                    </Link>
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
                    title="Pending Call List"
                    searchValue={search}
                    onSearchChange={handleSearchChange}
                    onCreate={() => alert("Create new lead button clicked")}
                />
            </div>

            <div className="flex-1 flex flex-col">
                <ReusableTable
                    data={paginatedData}
                    columns={columns}
                    columnPriority={{
                        actions: 1,
                        assignTo: 2,
                        date: 3,
                        projectName: 4,
                        phone: 5,
                        leadsSource: 6,
                        leadsStatus: 7,
                        customerName: 8,
                        profession: 9,
                        id: 10,
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

export default PendingCallListPage;