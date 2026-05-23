import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditBrandModal from "@/components/common/modals/AddEditBrandModal";

import getPermission from "@/utils/helper/getPermission";
import { IBrand } from "@/schemas/admin/inventory/brandSchema";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetAllBrandsQuery,
  useUpdateBrandMutation,
} from "@/components/store/api/inventory/brandApi";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const BrandsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<IBrand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<IBrand | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: brandData,
    refetch,
    isLoading,
  } = useGetAllBrandsQuery({
    search: searchTerm,
    page: page + 1,
    size: rowsPerPage,
  });

  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const brands = brandData?.data ?? [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleModalClose = () => {
    setEditingBrand(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateBrand = async (data: any) => {
    try {
      await createBrand(data).unwrap();
      toast.success("Brand created successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create brand");
    }
  };

  const handleUpdateBrand = async (id: number, data: any) => {
    try {
      await updateBrand({ id, data }).unwrap();
      toast.success("Brand updated successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update brand");
    }
  };

  const handleDeleteClick = (brand: IBrand) => {
    setBrandToDelete(brand);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    try {
      await deleteBrand(brandToDelete.id).unwrap();
      toast.success("Brand deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete brand");
    } finally {
      setIsDeleteOpen(false);
      setBrandToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<IBrand>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => row.index + 1 + page * rowsPerPage,
    },
    { accessorKey: "name", header: "Name" },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-3">
          {getPermission("Brand", "update") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100"
              onClick={() => {
                setEditingBrand(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Brand", "delete") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100 text-red-400"
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
        title="Brand List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(0)}
        hasCreatePermission={getPermission("Brand", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <AddEditBrandModal
            onClose={handleModalClose}
            editingBrand={editingBrand}
            onCreate={handleCreateBrand}
            onUpdate={handleUpdateBrand}
          />
        }
        modalTitle={editingBrand ? "Edit Brand" : "Create Brand"}
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
              {[5, 10, 15, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <ReusableTable<IBrand>
          columns={columns}
          data={brands}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={brandData?.meta?.total}
          setCurrentPage={setPage}
          isLoading={isLoading}
          columnPriority={{
            actions: 1,
            name: 2,
            branchId: 3,
            id: 4,
          }}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={brandToDelete?.name}
        itemType="brand"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default BrandsPage;
