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
import CreateEditChequeModal from "@/components/common/modals/CreateEditChequeModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { useDeleteChequeMutation, useGetAllChequesQuery } from "@/components/store/api/chequeManager/chequeApi";

interface ChequeType {
  id: number;
  branchId: number;
  bankId: number;
  customerId: number;
  chequeNumber: string;
  amount: number;
  checkDate: string;
  submitDate: string;
  status?: string;
  bank?: { name?: string };
  customer?: { accountType?: string };
  createdAt?: string;
}

const ChequeList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<ChequeType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chequeToDelete, setChequeToDelete] = useState<ChequeType | null>(null);

  const {
    data: chequeData,
    isLoading,
    error,
    refetch,
  } = useGetAllChequesQuery(
    {
      page,
      size: rowsPerPage,
      search: searchTerm,
    },
  );

  const [deleteCheque, { isLoading: isDeleting }] = useDeleteChequeMutation();

  const cheques = chequeData?.data || [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCheque(null);
    refetch();
  };

  const handleEdit = (cheque: ChequeType) => {
    setEditingCheque(cheque);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cheque: ChequeType) => {
    setChequeToDelete(cheque);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chequeToDelete) return;

    try {
      await deleteCheque(chequeToDelete.id).unwrap();
      toast.success("Cheque deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete cheque");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setChequeToDelete(null);
    }
  };

  const columns: ColumnDef<ChequeType>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "chequeNumber",
      header: "Cheque #",
    },
    {
      accessorKey: "bank.name",
      header: "Bank",
      cell: ({ row }) => row.original.bank?.name || "-",
    },
    {
      accessorKey: "customer.accountType",
      header: "Customer",
      cell: ({ row }) => row.original.customer?.accountType || "-",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "checkDate",
      header: "Check Date",
      cell: ({ row }) => timeDateFormatter(row.original.checkDate),
    },
    {
      accessorKey: "submitDate",
      header: "Submit Date",
      cell: ({ row }) => timeDateFormatter(row.original.submitDate),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-4 justify-left">
          {getPermission("Cheque", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("Cheque", "delete") && (
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
          Error loading cheques. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      <ReusableTableHeader
        title="Cheque List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Cheque", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateEditChequeModal onClose={handleModalClose} editingCheque={editingCheque} />
        }
        modalTitle={editingCheque ? "Edit Cheque" : "Create Cheque"}
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
        <ReusableTable<ChequeType>
          columns={columns}
          data={cheques}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={chequeData?.meta?.total}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            chequeNumber: 2,
            "bank.name": 3,
            "customer.name": 4,
            amount: 5,
            checkDate: 6,
            submitDate: 7,
            status: 8,
            id: 9,
          }}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={chequeToDelete?.chequeNumber}
        itemType="cheque"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ChequeList;
