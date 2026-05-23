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
import {
  useDeleteSubcategoryMutation,
  useGetAllSubcategoriesQuery,
} from "@/components/store/api/inventory/subCategoryApi";
import CreateEditSubCategoryModal from "@/components/common/modals/CreateEditSubCategoryModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

interface SubCategoryType {
  id: number;
  branchId: number;
  categoryId: number;
  name: string;
  category: {
    name: string;
  };
  createdDate: string;
  createdAt: string;
  updatedAt: string;
}

const SubCategoryList: React.FC = () => {
  // State Management
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<SubCategoryType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<SubCategoryType | null>(null);

  // API Hooks
  const {
    data: subCategoryData,
    isLoading,
    error,
    refetch,
  } = useGetAllSubcategoriesQuery(
    {
      page,
      size: rowsPerPage,
      search: searchTerm,
    },
  );

  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteSubcategoryMutation();

  // Extract data from API response
  const subCategories = subCategoryData?.data || [];

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
  const handleEdit = (department: SubCategoryType) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  // Handle delete button click - open dialog
  const handleDeleteClick = (department: SubCategoryType) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartment(departmentToDelete.id).unwrap();
      toast.success("SubCategory deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete subCategory");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };

  // Columns
  const columns: ColumnDef<SubCategoryType>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "category.name",
      header: "Category Name",
    },
    {
      accessorKey: "name",
      header: "Sub Category Name",
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
          {getPermission("SubCategory", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("SubCategory", "delete") && (
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
          Error loading subCategories. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Sub Category List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("SubCategory", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateEditSubCategoryModal
            onClose={handleModalClose}
            editingDepartment={editingDepartment}
          />
        }
        modalTitle={
          editingDepartment ? "Edit Sub Category" : "Create Sub Category"
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
        <ReusableTable<SubCategoryType>
          columns={columns}
          data={subCategories}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={subCategoryData?.meta?.total}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            name: 2,
            "category.name": 3,
            createdAt: 4,
            id: 5,
          }}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={departmentToDelete?.name}
        itemType="subCategory"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default SubCategoryList;
