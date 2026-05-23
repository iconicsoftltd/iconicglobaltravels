import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditLedgerModal from "@/components/common/modals/AddEditLedgerModal";
import { ILedger } from "@/schemas/admin/ledger/ledgerSchema";

import {
  useCreateLedgerMutation,
  useDeleteLedgerMutation,
  useGetAllLedgersQuery,
  useUpdateLedgerMutation,
} from "@/components/store/api/ledger/ledgerApi";
import getPermission from "@/utils/helper/getPermission";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const LedgersPage: React.FC = () => {
  // --- State Management ---
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<ILedger | null>(null);
  const [ledgerToDelete, setLedgerToDelete] = useState<ILedger | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: ledgerData,
    refetch,
    isLoading,
  } = useGetAllLedgersQuery({
    search: searchTerm,
    page: page,
    size: rowsPerPage,
  });

  const [createLedger] = useCreateLedgerMutation();
  const [updateLedger] = useUpdateLedgerMutation();
  const [deleteLedger, { isLoading: isDeleting }] = useDeleteLedgerMutation();

  const ledgers = ledgerData?.data ?? [];
  const totalItems = ledgerData?.meta?.total ?? ledgers.length;

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleModalClose = () => {
    setEditingLedger(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateLedger = async (data: any) => {
    try {
      await createLedger(data).unwrap();
      toast.success("Ledger created successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create ledger");
    }
  };

  const handleUpdateLedger = async (id: number, data: any) => {
    try {
      await updateLedger({ id, data }).unwrap();
      toast.success("Ledger updated successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update ledger");
    }
  };

  const handleDeleteClick = (ledger: ILedger) => {
    setLedgerToDelete(ledger);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ledgerToDelete) return;
    try {
      await deleteLedger(ledgerToDelete.id).unwrap();
      toast.success("Ledger deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete ledger");
    } finally {
      setIsDeleteOpen(false);
      setLedgerToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<ILedger>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "ledgerType",
      header: "Ledger Name",
    },
    {
      accessorKey: "group.accountType",
      header: "Group",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <span>{row.original.balance?.toLocaleString() ?? 0}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            row.original.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-3">
          {getPermission("Ledger", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100 text-gray-600"
              size="icon"
              onClick={() => {
                setEditingLedger(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Ledger", "delete") && (
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

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Ledger List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Ledger", "create")}
        onModalClose={handleModalClose}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <AddEditLedgerModal
            onClose={handleModalClose}
            editingLedger={editingLedger}
            onCreate={handleCreateLedger}
            onUpdate={handleUpdateLedger}
          />
        }
        modalTitle={editingLedger ? "Edit Ledger" : "Create Ledger"}
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

      {/* Table */}
      <div className="space-y-4">
        <ReusableTable<ILedger>
          columns={columns}
          data={ledgers}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          setCurrentPage={setPage}
          isLoading={isLoading}
          columnPriority={{
            actions: 1,
            ledgerType: 2,
            group: 3,
            code: 4,
            balance: 5,
            isActive: 6,
            id: 7,
          }}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={ledgerToDelete?.ledgerType}
        itemType="ledger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LedgersPage;
