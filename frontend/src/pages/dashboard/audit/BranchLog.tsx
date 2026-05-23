import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FaEye } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import getPermission from "@/utils/helper/getPermission";
import HomeLoader from "@/components/loader/HomeLoader";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { useGetBranchLogAllQuery, useGetBranchLogByIdQuery } from "@/components/store/api/audit/auditApi";
import { dateFormatter } from "@/utils/helper/dateFormatter";
import ReusableLogViewModal from "@/components/common/modals/logModals/ReusableLogViewModal";

interface IBranchLog {
  id: number;
  date: string;
  action: string;
  module: string;
  entity: string;
  description: string;
  ip: string
}

const BranchLogPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogId, setSelectedLogId] =
    useState<number | null>(null);

  console.log("selectedLogId", selectedLogId);

  // API
  const {
    data: rolesData,
    isLoading,
    error,
  } = useGetBranchLogAllQuery(
    { page, size: rowsPerPage, search: searchTerm },
  );

  const {
    data: singleLogData,
    isLoading: isSingleLogLoading,
  } = useGetBranchLogByIdQuery(selectedLogId, { skip: !selectedLogId });

  const roles = rolesData?.data || [];
  const totalItems = rolesData?.meta?.total || 0;

  const columns: ColumnDef<IBranchLog>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (row?.original?.date ? dateFormatter(row?.original?.date) : "N/A"),
    },
    {
      accessorKey: "ip",
      header: "IP",
    },
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) =>
        getPermission("Audit_Log", "read") && (
          <Button
            variant="outline"
            size="icon"
            className="bg-gray-100 text-blue-500"
            onClick={() => setSelectedLogId(row.original.id)}
          >
            <FaEye />
          </Button>
        ),
    },
  ];

  if (isLoading || isSingleLogLoading) return <HomeLoader />;
  if (error)
    return (
      <div className="text-center text-red-500 p-8">Error loading roles</div>
    );

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Branch Log"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={false}
      />

      {/* Filters */}
      <div className="flex justify-between items-center border p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <ReusableTable<IBranchLog>
        columns={columns}
        data={roles}
        currentPage={page}
        itemsPerPage={rowsPerPage}
        totalItems={totalItems}
        setCurrentPage={setPage}
        columnPriority={{
          actions: 1,
          name: 2,
          isSystemRole: 3,
          createdAt: 4,
          id: 5,
          select: 6,
        }}
      />

      {/* Role Details Dialog */}
      <ReusableLogViewModal
        open={!!selectedLogId}
        onOpenChange={() => setSelectedLogId(null)}
        viewData={singleLogData?.data}
        title="Company Log"
      />
    </div>
  );
};

export default BranchLogPage;
