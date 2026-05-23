import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FaEye } from "react-icons/fa6";
import { ReusableTable } from "@/components/common/ReusableTable";
import { Link } from "react-router-dom";
import {
  useDeleteVoucherMutation,
  useGetAllVouchersQuery,
} from "@/components/store/api/voucher/receiptVoucherApi";

import HomeLoader from "@/components/loader/HomeLoader";
import getPermission from "@/utils/helper/getPermission";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

interface VoucherRowType {
  id: number;
  invoice: string;
  date: string;
  debit: string;
  credit: string;
  note: string;
}

const ReceiptVoucherList: React.FC = () => {
  // --- State Management ---
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<any | null>(null);

  const [deleteVoucher, { isLoading: isDeleting }] = useDeleteVoucherMutation();
  // --- Fetch Data ---
  const { data: voucherData, isLoading: isVoucherLoading } =
    useGetAllVouchersQuery({
      page,
      size: rowsPerPage,
      search: searchTerm,
      type: "RECEIPT",
    });

  // --- Transform API data into flat voucher-level rows ---
  const dynamicData: VoucherRowType[] = useMemo(() => {
    if (!voucherData?.data) return [];

    return voucherData.data.map((voucher: any) => {
      const totalDebit = voucher.particulars
        .filter((p: any) => p.type === "Debit")
        .reduce((sum: number, p: any) => sum + p.amount, 0);

      const totalCredit = voucher.particulars
        .filter((p: any) => p.type === "Credit")
        .reduce((sum: number, p: any) => sum + p.amount, 0);

      return {
        id: voucher.id,
        invoice: voucher.voucherNo,
        date: new Date(voucher.date).toLocaleDateString("en-GB"),
        debit: totalDebit.toString(),
        credit: totalCredit.toString(),
        note: voucher.narration || "N/A",
      };
    });
  }, [voucherData]);

  // --- Filter + Pagination ---
  const filteredData = dynamicData.filter((item) =>
    item.invoice.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredData.length;
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  // --- Selection Logic ---
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

  // Handle delete button click - open dialog
  const handleDeleteClick = (voucher: any) => {
    setVoucherToDelete(voucher);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!voucherToDelete) return;

    try {
      await deleteVoucher(voucherToDelete.id).unwrap();
      toast.success("Voucher deleted successfully");
    } catch (error) {
      toast.error("Failed to delete voucher");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setVoucherToDelete(null);
    }
  };

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedRows.includes(item.id));

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  // --- Table Columns ---
  const columns: ColumnDef<VoucherRowType>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
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
      header: "SL",
      cell: ({ row }) => row.index + 1 + (page - 1) * rowsPerPage,
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
      accessorKey: "debit",
      header: "Total Debit",
    },
    {
      accessorKey: "credit",
      header: "Total Credit",
    },
    {
      accessorKey: "note",
      header: "Note",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-3">
          {getPermission("Voucher", "read") && (
            <Link to={`/view-receipt-voucher/${row.original.id}`}>
              <Button variant="outline" className="bg-gray-100" size="icon">
                <FaEye />
              </Button>
            </Link>
          )}
          {getPermission("Voucher", "update") && (
            <Link to={`/edit-receipt-voucher/${row.original.id}`}>
              <Button
                variant="outline"
                className="bg-gray-100"
                size="icon"
                onClick={() => ""}
              >
                <FaRegEdit />
              </Button>
            </Link>
          )}
          {getPermission("Voucher", "delete") && (
            <Button
              variant="outline"
              className="bg-gray-100 text-red-400"
              size="icon"
              onClick={() => handleDeleteClick(row.original)}
            >
              <FaTrashAlt />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // --- Loading and Empty States ---
  if (isVoucherLoading) return <HomeLoader />;

  // --- Render ---
  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Receipt Voucher List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Voucher", "create")}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        createButtonLink="/create-receipt-voucher"
        searchPlaceholder="Search by invoice"
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => handleRowsPerPageChange(Number(val))}
          >
            <SelectTrigger className="w-[70px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={voucherToDelete?.invoice}
        itemType="ledger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Table */}
      <div className="space-y-4">
        {voucherData?.data?.length > 0 ? (
          <>
            {" "}
            <ReusableTable<VoucherRowType>
              columns={columns}
              data={paginatedData}
              currentPage={page}
              itemsPerPage={rowsPerPage}
              totalItems={totalItems}
              setCurrentPage={setPage}
              columnPriority={{
                actions: 1,
                invoice: 2,
                date: 3,
                debit: 4,
                credit: 5,
                note: 6,
                id: 7,
                select: 8,
              }}
            />
          </>
        ) : (
          <div className="text-center mt-10 text-gray-500">
            No vouchers found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptVoucherList;
