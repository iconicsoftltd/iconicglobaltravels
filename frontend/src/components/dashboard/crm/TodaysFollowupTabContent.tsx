import { ReusableTable } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/ui/section-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

// Interface matches the table structure: #id No., Call Date, Call Summary, Next Call Date
interface CallEntry {
    id: number;
    callDate: string;
    callSummary: string;
    nextCallDate: string;
}

const TodaysFollowupTabContent = () => {
    // Modified data according to the image
    const mockCallData: CallEntry[] = [
        { id: 1, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { id: 2, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { id: 3, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { id: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { id: 5, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
    ];

    // Define columns based on the new data and image headers
    const columns: ColumnDef<CallEntry>[] = [
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
        // Using original 'id' from data for consistency with image's '#id No.'
        { accessorKey: "id", header: "SN", cell: ({ row }) => row.index + 1 },
        { accessorKey: "callDate", header: "Call Date" },
        { accessorKey: "callSummary", header: "Call Summary" },
        { accessorKey: "nextCallDate", header: "Next Call Date" },
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
    
    const [search, setSearch] = useState("");
    const tableData = mockCallData.map((item, idx) => ({ ...item, id: idx })); 
    const [page, setPage] = useState<number>(0);
    const rowsPerPage = 5;
    const paginatedData = tableData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <>
            {/* section header  */}
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
                    smMobile: 5,
                    mobile: 5,
                    tablet: 6, 
                }}
            />
        </>
    );
};

export default TodaysFollowupTabContent;