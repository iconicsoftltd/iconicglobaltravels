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
import toast from "react-hot-toast";
import CreateBranchAssignModel from "../../../components/common/modals/CreateBranchAssignModel";
import {
  useDeleteBranchAssignMutation,
  useGetAllBranchAssignsQuery,
} from "@/components/store/api/branch/branchAssignApi";


import HomeLoader from "@/components/loader/HomeLoader";
import getPermission from "@/utils/helper/getPermission";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

interface BranchAssignType {
  userId: number;
  id: number;
  branchId: number;
  branch: {
    name: string;
  };
  user: {
    role: {
      name: string;
    };
    employee: {
      name: string;
      uuid: string;
      email: string;
    };
  };
}

const BranchAssignList: React.FC = () => {
  // State Management
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchAssignType | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<BranchAssignType | null>(
    null
  );

  // API Hooks
  const {
    data: branchesData,
    isLoading,
    error,
    refetch,
  } = useGetAllBranchAssignsQuery(
    {
      page,
      size: rowsPerPage,
      search: searchTerm,
    },
  );

  const [deleteBranch, { isLoading: isDeleting }] =
    useDeleteBranchAssignMutation();

  // Extract data from API response
  const branches = branchesData?.data || [];
  const totalItems = branchesData?.totalCount || 0;

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when rows per page changes
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    refetch(); // Refetch data after modal closes to get updated list
  };

  // Handle edit company
  const handleEdit = (branch: BranchAssignType) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  // Handle delete button click - open dialog
  const handleDeleteClick = (branch: BranchAssignType) => {
    setBranchToDelete(branch);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;

    try {
      await deleteBranch(branchToDelete.id).unwrap();
      toast.success("Company assign deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete company assign");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  // Columns
  const columns: ColumnDef<BranchAssignType>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      header: "Company Assign",
      accessorFn: (row) => row.branch?.name ?? "—",
    },
    {
      header: "Role",
      accessorFn: (row) => row.user?.role?.name ?? "—",
    },
    {
      header: "Employee Name",
      accessorFn: (row) => row.user?.employee?.name ?? "—",
    },
    {
      header: "Email",
      accessorFn: (row) => row.user?.employee?.email ?? "—",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-4 justify-left">
          {getPermission("Branch_Assign", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Branch_Assign", "delete") && (
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
          Error loading company assigns. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      {getPermission("Branch_Assign", "read") ? (
        <>
          {/* Header */}
          <ReusableTableHeader
            title="Company Assign List"
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearchReset={() => setPage(1)}
            hasCreatePermission={getPermission("Branch_Assign", "create")}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onModalClose={handleModalClose}
            createButtonLabel="Create"
            createButtonIcon={<Plus size={20} />}
            modalContent={
              <CreateBranchAssignModel
                onClose={handleModalClose}
                editingBranch={editingBranch}
              />
            }
            modalTitle={
              editingBranch ? "Edit Company Assign" : "Create Company Assign"
            }
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
            {getPermission("Branch_Assign", "read") && (
              <ReusableTable<BranchAssignType>
                columns={columns}
                data={branches}
                currentPage={page}
                itemsPerPage={rowsPerPage}
                totalItems={totalItems}
                setCurrentPage={setPage}
                columnPriority={{
                  actions: 1,
                  name: 2,
                  address: 3,
                  "user.role.name": 4,
                  "user.employee.name": 5,
                  "user.employee.email": 6,
                  id: 7,
                }}
              />
            )}
          </div>

          <DeleteConfirmModal
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            itemName={branchToDelete?.branch?.name}
            itemType="ledger"
            loading={isDeleting}
            onConfirm={handleDeleteConfirm}
          />
        </>
      ) : (
        <Heading className="text-[#5e48d8] font-semibold text-center justify-center text-7xl">
          No Permission for this page
        </Heading>
      )}
    </div>
  );
};

export default BranchAssignList;
