import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditColorModal from "@/components/common/modals/AddEditColorModal";


import getPermission from "@/utils/helper/getPermission";
import { IColor } from "@/schemas/admin/inventory/colorSchema";
import {
  useCreateColorMutation,
  useDeleteColorMutation,
  useGetAllColorsQuery,
  useUpdateColorMutation,
} from "@/components/store/api/inventory/colorApi";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const ColorsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<IColor | null>(null);
  const [colorToDelete, setColorToDelete] = useState<IColor | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: colorData,
    refetch,
    isLoading,
  } = useGetAllColorsQuery({
    search: searchTerm,
    page: page + 1,
    size: rowsPerPage,
  });

  const [createColor] = useCreateColorMutation();
  const [updateColor] = useUpdateColorMutation();
  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();

  const colors = colorData?.data ?? [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleModalClose = () => {
    setEditingColor(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateColor = async (data: any) => {
    try {
      await createColor(data).unwrap();
      toast.success("Color created successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create color");
    }
  };

  const handleUpdateColor = async (id: number, data: any) => {
    try {
      await updateColor({ id, data }).unwrap();
      toast.success("Color updated successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update color");
    }
  };

  const handleDeleteClick = (color: IColor) => {
    setColorToDelete(color);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!colorToDelete) return;
    try {
      await deleteColor(colorToDelete.id).unwrap();
      toast.success("Color deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete color");
    } finally {
      setIsDeleteOpen(false);
      setColorToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<IColor>[] = [
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
          {getPermission("Color", "update") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100"
              onClick={() => {
                setEditingColor(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Color", "delete") && (
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
        title="Color List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(0)}
        hasCreatePermission={getPermission("Color", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <AddEditColorModal
            onClose={handleModalClose}
            editingColor={editingColor}
            onCreate={handleCreateColor}
            onUpdate={handleUpdateColor}
          />
        }
        modalTitle={editingColor ? "Edit Color" : "Create Color"}
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
        <ReusableTable<IColor>
          columns={columns}
          data={colors}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={colorData?.meta?.total}
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
        itemName={colorToDelete?.name}
        itemType="color"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ColorsPage;
