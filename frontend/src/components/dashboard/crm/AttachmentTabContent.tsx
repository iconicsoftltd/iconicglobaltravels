import { ReusableTable } from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/ui/section-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

interface AttachmentEntry {
    id: number;
    attachmentSummary: string;
    attachment: string;
}

const AttachmentTabContent = () => {
    const mockAttachmentData: AttachmentEntry[] = [
        { id: 1, attachmentSummary: "N/A", attachment: "N/A" },
        { id: 2, attachmentSummary: "N/A", attachment: "N/A" },
        { id: 3, attachmentSummary: "N/A", attachment: "N/A" },
        { id: 4, attachmentSummary: "N/A", attachment: "N/A" },
    ];

    // Define columns based on the new data and image headers
    const columns: ColumnDef<AttachmentEntry>[] = [
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
        { accessorKey: "id", header: "SN", cell: ({ row }) => row.index + 1 },
        { accessorKey: "attachmentSummary", header: "Attachment Summary" },
        { accessorKey: "attachment", header: "Attachment" },
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

    // State and pagination logic
    const [search, setSearch] = useState("");
    // Map data to include an 'id' for the table component
    const tableData = mockAttachmentData.map((item, idx) => ({ ...item, id: idx })); 
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
                // Cast columns to satisfy ReusableTable's expected prop type
                columns={columns as ColumnDef<any>[]}
                columnPriority={{}}
                currentPage={page}
                itemsPerPage={rowsPerPage}
                totalItems={tableData?.length}
                setCurrentPage={setPage}
                visibleColumnsCount={{
                    smMobile: 4, // Adjusted for the smaller number of columns
                    mobile: 4,
                    tablet: 5, // The table has 4 visible columns + 1 for checkbox
                }}
            />
        </>
    );
};

export default AttachmentTabContent;