import { ReusableTable } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/ui/section-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

interface MeetingEntry {
    id: number;
    meetingDate: string;
    summary: string;
    nextDate: string;
    responsible: string;
    location: string;
    attendPerson: string;
}

const ManageMittingTabContent = () => {
    // Modified data according to the image
    const mockMeetingData: MeetingEntry[] = [
        { 
            id: 1, 
            meetingDate: "05-06-25", 
            summary: "Meeting Fixed With Him Next Week Same Days .", 
            nextDate: "18-04-2024",
            responsible: "Pre-Plan About Follow Up Pushing For Project Visit And Price Details .",
            location: "Banani, 11 No Road, 234 No House.",
            attendPerson: "Md. Rasel",
        },
        { 
            id: 1, 
            meetingDate: "05-06-25", 
            summary: "Meeting Fixed With Him Next Week Same Days .", 
            nextDate: "18-04-2024",
            responsible: "Pre-Plan About Follow Up Pushing For Project Visit And Price Details .",
            location: "Banani, 11 No Road, 234 No House.",
            attendPerson: "Md. Rasel",
        },
    ];

    const columns: ColumnDef<MeetingEntry>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex justify-center">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(!!e.target.checked)}
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        { accessorKey: "index", header: "SN", cell: ({ row }) => row.index + 1 },
        { accessorKey: "meetingDate", header: "Meeting Date" },
        { accessorKey: "summary", header: "Summary" },
        { accessorKey: "nextDate", header: "Next Date" },
        { accessorKey: "responsible", header: "Responsible" },
        { accessorKey: "location", header: "Location" },
        { accessorKey: "attendPerson", header: "Attend Person" },
        {
            id: "actions",
            header: "Action",
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-500">
                        <FaRegEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                        <FaTrashAlt className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];
    
    // Adjusting type and keys for the new data structure
    const tableData = mockMeetingData.map(item => ({ ...item, id: item.id }));
    
    // State and pagination logic
    const [search, setSearch] = useState("");
    const [page, setPage] = useState<number>(0);
    const rowsPerPage = 5;
    const paginatedData = tableData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <>
            <SectionHeader
                searchValue={search}
                onSearchChange={setSearch}
                onCreate={() => alert("Create button clicked")}
            />

            <ReusableTable
                data={paginatedData}
                columns={columns as ColumnDef<any>[]}
                columnPriority={{}}
                currentPage={page}
                itemsPerPage={rowsPerPage}
                totalItems={tableData?.length}
                setCurrentPage={setPage}
                visibleColumnsCount={{
                    smMobile: 6,
                    mobile: 6,
                    tablet: 8,
                }}
            />
        </>
    );
};

export default ManageMittingTabContent;