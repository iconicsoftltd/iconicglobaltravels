import { ReusableTable } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/ui/section-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

interface CallEntry {
    index: number;
    callDate: string;
    callSummary: string;
    nextCallDate: string;
}



const ManageCallTabContent = () => {
    const mockCallData: CallEntry[] = [
        { index: 1, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 2, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 3, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
        { index: 4, callDate: "18-04-2024", callSummary: "Need To Call Again", nextCallDate: "18-04-2024" },
    ];

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
        { accessorKey: "index", header: "SN", cell: ({ row }) => row.index + 1 },
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
    const tableData = mockCallData.map(item => ({ ...item, id: item.index }));
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
                    smMobile: 6,
                    mobile: 6,
                    tablet: 6,
                }}
            />
        </>
    );
};

export default ManageCallTabContent