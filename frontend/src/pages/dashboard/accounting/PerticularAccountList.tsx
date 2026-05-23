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
import Heading from "@/components/typography/Heading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";


import getPermission from "@/utils/helper/getPermission";
import HomeLoader from "@/components/loader/HomeLoader";
import {
  useDeleteParticularMutation,
  useGetAllParticularQuery,
} from "@/components/store/api/particularAccount/particularAccountApi";
import { FaEye } from "react-icons/fa6";
import CreateParticularAccountModal from "@/components/common/modals/CreateParticularAccountModal";
import ViewParticularAccountModal from "@/components/common/modals/ViewParticularAccountModal";
import { timeDateFormatter } from "@/utils/helper/timeDateFormatter";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

export interface ParticularAccountType {
  id: number;
  branchId: number;
  ledgerId: number;
  type: "Debit" | "Credit";
  balance: number;
  openingBalance: number;
  openingBalanceType: "Debit" | "Credit";
  openingBalanceDate: string;
  companyName: string | null;
  accountType: string;
  mobileNumber: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  ledger: {
    id: number;
    branchId: number;
    groupAccountId: number;
    ledgerType: string;
    code: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    group: {
      id: number;
      branchId: number;
      account: string;
      accountType: string;
      code: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

const ParticularAccountList: React.FC = () => {
  // State Management
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingParticular, setEditingParticular] =
    useState<ParticularAccountType | null>(null);
  const [viewingParticular, setViewingParticular] =
    useState<ParticularAccountType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [particularToDelete, setParticularToDelete] =
    useState<ParticularAccountType | null>(null);

  // API Hooks
  const {
    data: particularData,
    isLoading,
    error,
    refetch,
  } = useGetAllParticularQuery(
    {
      page,
      size: rowsPerPage,
      search: searchTerm,
    },
  );

  const [deleteParticular] = useDeleteParticularMutation();

  // Extract data from API response
  const particularAccounts = particularData?.data || [];
  const totalItems = particularData?.meta?.total || 0;

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingParticular(null);
    refetch();
  };

  // Handle view modal close
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingParticular(null);
  };

  // Handle edit particular
  const handleEdit = (particular: ParticularAccountType) => {
    setEditingParticular(particular);
    setIsModalOpen(true);
  };

  // Handle view particular
  const handleView = (particular: ParticularAccountType) => {
    setViewingParticular(particular);
    setIsViewModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (particular: ParticularAccountType) => {
    setParticularToDelete(particular);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!particularToDelete) return;

    try {
      await deleteParticular(particularToDelete.id).unwrap();
      toast.success("Particular account deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete particular account");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setParticularToDelete(null);
    }
  };

  // Format date for display

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BN", {
      style: "currency",
      currency: "BDT",
    }).format(amount);
  };

  // Columns
  const columns: ColumnDef<ParticularAccountType>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "ledger.ledgerType",
      header: "Ledger Name",
    },

    {
      accessorKey: "accountType",
      header: "Account Name",
    },
    {
      accessorKey: "ledger.code",
      header: "Code",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        // <span
        //   className={`px-2 py-1 rounded text-xs font-medium ${
        //     row.original.type === "Debit"
        //       ? "bg-red-100 text-red-800"
        //       : "bg-green-100 text-green-800"
        //   }`}
        // >
        <span
          className={`px-2 py-1 rounded text-sm  font-semibold `}
        >
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "openingBalance",
      header: "Opening Balance",
      cell: ({ row }) => formatCurrency(row.original.openingBalance),
    },
    {
      accessorKey: "balance",
      header: "Current Balance",
      cell: ({ row }) => formatCurrency(row.original.balance),
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
        <div className="flex gap-2 justify-left">
          {/* View Button */}
          <Button
            variant="outline"
            className="bg-gray-100"
            size="icon"
            onClick={() => handleView(row.original)}
          >
            <FaEye size={16} />
          </Button>

          {/* Edit Button */}
          {getPermission("Particular", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {/* Delete Button */}
          {getPermission("Particular", "delete") && (
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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HomeLoader />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          Error loading particular accounts. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Particular Account List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Particular", "create")}
        onModalClose={handleModalClose}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateParticularAccountModal
            onClose={handleModalClose}
            editingParticular={editingParticular}
          />
        }
        modalTitle={editingParticular ? "Edit Particular" : "Create Particular"}
      />

      {/* Filters */}
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

      {/* Table */}
      <div className="space-y-4">
        <ReusableTable<ParticularAccountType>
          columns={columns}
          data={particularAccounts}
          columnPriority={{
            actions: 1,
            "ledger.ledgerType": 2,
            accountType: 3,
            type: 4,
            balance: 5,
            "ledger.code": 6,
            openingBalance: 7,
            createdAt: 8,
            id: 9,
          }}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          setCurrentPage={setPage}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <Heading className="text-red-600 font-semibold">
              Confirm Delete
            </Heading>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the particular account{" "}
              <strong>"{particularToDelete?.ledger?.ledgerType}"</strong>? This
              action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Heading className="text-[#5e48d8] font-semibold">
              Particular Account Details
            </Heading>
          </DialogHeader>
          <ViewParticularAccountModal
            particular={viewingParticular}
            onClose={handleViewModalClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticularAccountList;
