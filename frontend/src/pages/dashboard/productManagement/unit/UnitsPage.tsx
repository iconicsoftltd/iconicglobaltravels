import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditUnitModal from "@/components/common/modals/AddEditUnitModal";


import getPermission from "@/utils/helper/getPermission";
import { IUnit } from "@/schemas/admin/inventory/unitSchema";
import {
  useCreateUnitMutation,
  useDeleteUnitMutation,
  useGetAllUnitsQuery,
  useUpdateUnitMutation,
} from "@/components/store/api/inventory/unitApi";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const UnitsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<IUnit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<IUnit | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: unitData,
    refetch,
    isLoading,
  } = useGetAllUnitsQuery({
    search: searchTerm,
    page: page + 1,
    size: rowsPerPage,
  });

  const [createUnit] = useCreateUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();
  const [deleteUnit, { isLoading: isDeleting }] = useDeleteUnitMutation();

  const units = unitData?.data ?? [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleModalClose = () => {
    setEditingUnit(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateUnit = async (data: any) => {
    try {
      await createUnit(data).unwrap();
      toast.success("Unit created successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create unit");
    }
  };

  const handleUpdateUnit = async (id: number, data: any) => {
    try {
      await updateUnit({ id, data }).unwrap();
      toast.success("Unit updated successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update unit");
    }
  };

  const handleDeleteClick = (unit: IUnit) => {
    setUnitToDelete(unit);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;
    try {
      await deleteUnit(unitToDelete.id).unwrap();
      toast.success("Unit deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete unit");
    } finally {
      setIsDeleteOpen(false);
      setUnitToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<IUnit>[] = [
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
          {getPermission("Unit", "update") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100"
              onClick={() => {
                setEditingUnit(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Unit", "delete") && (
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
        title="Unit List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(0)}
        hasCreatePermission={getPermission("Unit", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <AddEditUnitModal
            onClose={handleModalClose}
            editingUnit={editingUnit}
            onCreate={handleCreateUnit}
            onUpdate={handleUpdateUnit}
          />
        }
        modalTitle={editingUnit ? "Edit Unit" : "Create Unit"}
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
        <ReusableTable<IUnit>
          columns={columns}
          data={units}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={unitData?.meta?.total}
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
        itemName={unitToDelete?.name}
        itemType="unit"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UnitsPage;
