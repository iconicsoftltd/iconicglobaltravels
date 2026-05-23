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


import getPermission from "@/utils/helper/getPermission";
import HomeLoader from "@/components/loader/HomeLoader";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import { timeDateFormatter } from "@/utils/helper/timeDateFormatter";
import CreateEditBankModal from "@/components/common/modals/CreateEditBankModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { useDeleteBankMutation, useGetAllBanksQuery } from "@/components/store/api/chequeManager/bankApi";

interface BankType {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const BankList: React.FC = () => {
  // State Management
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<BankType | null>(null);

  // API Hooks
  const {
    data: bankData,
    isLoading,
    error,
    refetch,
  } = useGetAllBanksQuery(
    {
      page,
      size: rowsPerPage,
      search: searchTerm,
    },
  );

  const [deleteBank, { isLoading: isDeleting }] = useDeleteBankMutation();

  const banks = bankData?.data || [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBank(null);
    refetch();
  };

  const handleEdit = (bank: BankType) => {
    setEditingBank(bank);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (bank: BankType) => {
    setBankToDelete(bank);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bankToDelete) return;

    try {
      await deleteBank(bankToDelete.id).unwrap();
      toast.success("Bank deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete bank");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setBankToDelete(null);
    }
  };

  const columns: ColumnDef<BankType>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Bank Name",
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => timeDateFormatter(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-4 justify-left">
          {getPermission("Bank", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("Bank", "delete") && (
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

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HomeLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          Error loading banks. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      <ReusableTableHeader
        title="Bank List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Bank", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateEditBankModal onClose={handleModalClose} editingBank={editingBank} />
        }
        modalTitle={editingBank ? "Edit Bank" : "Create Bank"}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Row per page</span>
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

      <div className="space-y-4">
        <ReusableTable<BankType>
          columns={columns}
          data={banks}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={bankData?.meta?.total}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            name: 2,
            createdAt: 3,
            id: 4,
          }}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={bankToDelete?.name}
        itemType="bank"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default BankList;
