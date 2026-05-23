import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditSizeModal from "@/components/common/modals/AddEditSizeModal";


import getPermission from "@/utils/helper/getPermission";
import { ISize } from "@/schemas/admin/inventory/sizeSchema";
import {
  useCreateSizeMutation,
  useDeleteSizeMutation,
  useGetAllSizesQuery,
  useUpdateSizeMutation,
} from "@/components/store/api/inventory/sizeApi";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const SizesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<ISize | null>(null);
  const [sizeToDelete, setSizeToDelete] = useState<ISize | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: sizeData,
    refetch,
    isLoading,
  } = useGetAllSizesQuery({
    search: searchTerm,
    page: page + 1,
    size: rowsPerPage,
  });

  const [createSize] = useCreateSizeMutation();
  const [updateSize] = useUpdateSizeMutation();
  const [deleteSize, { isLoading: isDeleting }] = useDeleteSizeMutation();

  const sizes = sizeData?.data ?? [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleModalClose = () => {
    setEditingSize(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateSize = async (data: any) => {
    try {
      await createSize(data).unwrap();
      toast.success("Size created successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create size");
    }
  };

  const handleUpdateSize = async (id: number, data: any) => {
    try {
      await updateSize({ id, data }).unwrap();
      toast.success("Size updated successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update size");
    }
  };

  const handleDeleteClick = (size: ISize) => {
    setSizeToDelete(size);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sizeToDelete) return;
    try {
      await deleteSize(sizeToDelete.id).unwrap();
      toast.success("Size deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete size");
    } finally {
      setIsDeleteOpen(false);
      setSizeToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<ISize>[] = [
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
          {getPermission("Size", "update") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100"
              onClick={() => {
                setEditingSize(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Size", "delete") && (
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
        title="Size List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(0)}
        hasCreatePermission={getPermission("Size", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <AddEditSizeModal
            onClose={handleModalClose}
            editingSize={editingSize}
            onCreate={handleCreateSize}
            onUpdate={handleUpdateSize}
          />
        }
        modalTitle={editingSize ? "Edit Size" : "Create Size"}
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
        <ReusableTable<ISize>
          columns={columns}
          data={sizes}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={sizeData?.meta?.total}
          setCurrentPage={setPage}
          isLoading={isLoading}
          columnPriority={{
            actions: 1,
            name: 2,
            branchId: 3,
          }}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={sizeToDelete?.name}
        itemType="size"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default SizesPage;
