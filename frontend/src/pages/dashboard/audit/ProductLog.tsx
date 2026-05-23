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
import {
  useGetProductLogAllQuery,
  useGetProductLogByIdQuery,
} from "@/components/store/api/audit/auditApi";
import ReusableLogViewModal from "@/components/common/modals/logModals/ReusableLogViewModal";

/* =======================
   TYPES
======================= */

interface ProductLogType {
  id: number;
  branchId: number;
  chequeId: number;
  ip: string;
  action: "CREATED" | "UPDATED" | "DELETED";
  updatedById: number;
  createdAt: string;
}

/* =======================
   COMPONENT
======================= */

const ProductLogPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  /* =======================
     API
  ======================= */

  const {
    data: logData,
    isLoading,
    error,
  } = useGetProductLogAllQuery({
    page,
    size: rowsPerPage,
    search: searchTerm,
  });

  const {
    data: singleLogData,
  } = useGetProductLogByIdQuery(selectedLogId, { skip: !selectedLogId });

  const logs: ProductLogType[] = logData?.data || [];
  const totalItems = logData?.meta?.total || 0;

  /* =======================
     HELPERS
  ======================= */

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* =======================
     COLUMNS
  ======================= */

  const columns: ColumnDef<ProductLogType>[] = [
    {
      id: "sl",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "ip",
      header: "IP Address",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            row.original.action === "CREATED"
              ? "bg-green-100 text-green-700"
              : row.original.action === "UPDATED"
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => formatDate(row.original.createdAt),
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

  /* =======================
     STATES
  ======================= */

  if (isLoading) return <HomeLoader />;

  if (error)
    return (
      <div className="text-center text-red-500 p-8">
        Error loading Cheque logs
      </div>
    );

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="p-4 min-h-screen space-y-4">
      <ReusableTableHeader
        title="Product Log"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={false}
      />

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

      <ReusableTable<ProductLogType>
        columns={columns}
        data={logs}
        currentPage={page}
        itemsPerPage={rowsPerPage}
        totalItems={totalItems}
        setCurrentPage={setPage}
        columnPriority={{
          actions: 1,
          createdAt: 2,
          action: 3,
          ip: 4,
          chequeId: 5,
          branchId: 6,
          sl: 7,
          select: 8,
        }}
      />

      <ReusableLogViewModal
        open={!!selectedLogId}
        onOpenChange={() => setSelectedLogId(null)}
        viewData={singleLogData?.data}
        title="Product Log"
      />
    </div>
  );
};

export default ProductLogPage;
