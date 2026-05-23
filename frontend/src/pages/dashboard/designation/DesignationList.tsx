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
import {
  useDeleteDesignationMutation,
  useGetAllDesignationsQuery,
} from "@/components/store/api/designation/designationApi";
import CreateDesignationModel from "../../../components/common/modals/CreateDesignationModel";
import HomeLoader from "@/components/loader/HomeLoader";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { timeDateFormatter } from "@/utils/helper/timeDateFormatter";

interface DepartmentType {
  id: number;
  branchId: number;
  name: string;
  createdDate: string;
  createdAt: string;
  updatedAt: string;
}

const DesignationList: React.FC = () => {
  // State Management
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<DepartmentType | null>(null);

  // API Hooks
  const {
    data: designationsData,
    isLoading,
    error,
    refetch,
  } = useGetAllDesignationsQuery(
    {
      page,
      size: rowsPerPage,
      search: searchTerm,
    },
  );

  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDesignationMutation();

  // Extract data from API response
  const designations = designationsData?.data || [];
  const totalItems = designationsData?.meta?.total || 0;

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when rows per page changes
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    refetch(); // Refetch data after modal closes to get updated list
  };

  // Handle edit department
  const handleEdit = (department: DepartmentType) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  // Handle delete button click - open dialog
  const handleDeleteClick = (department: DepartmentType) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartment(departmentToDelete.id).unwrap();
      toast.success("Designation deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete designation");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };


  // Columns
  const columns: ColumnDef<DepartmentType>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Designation Name",
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
          {getPermission("Designation", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("Designation", "delete") && (
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
          Error loading designations. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Designation List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Designation", "create")}
        onModalClose={handleModalClose}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateDesignationModel
            onClose={handleModalClose}
            editingDepartment={editingDepartment}
          />
        }
        modalTitle={
          editingDepartment ? "Edit Designation" : "Create Designation"
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
        <ReusableTable<DepartmentType>
          columns={columns}
          data={designations}
          columnPriority={{
            actions: 1,
            name: 2,
            createdAt: 3,
            id: 4,
          }}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          setCurrentPage={setPage}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={departmentToDelete?.name}
        itemType="ledger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default DesignationList;
