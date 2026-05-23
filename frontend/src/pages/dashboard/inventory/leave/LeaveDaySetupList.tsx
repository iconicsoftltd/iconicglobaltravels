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
import CreateEditLeaveDaySetupModal from "@/components/common/modals/CreateEditLeaveDaySetupModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { useDeleteLeaveDaySetupMutation, useGetAllLeaveDaySetupQuery } from "@/components/store/api/inventory/leave/leaveDaySetupApi";
import { ILeaveDaySetup } from "@/schemas/admin/inventory/leave/leaveDaySetupSchema";


const LeaveDaySetupList: React.FC = () => {
  // state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ILeaveDaySetup | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ILeaveDaySetup | null>(null);

  // API
  const { data: leaveData, isLoading, error, refetch } = useGetAllLeaveDaySetupQuery(
    { page, size: rowsPerPage, search: searchTerm },
  );

  const [deleteLeaveDaySetup, { isLoading: isDeleting }] = useDeleteLeaveDaySetupMutation();

  const rows: ILeaveDaySetup[] = leaveData?.data || [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    refetch();
  };

  const handleEdit = (item: ILeaveDaySetup) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: ILeaveDaySetup) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteLeaveDaySetup(itemToDelete.id).unwrap();
      toast.success("Leave Day Setup deleted successfully");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete leave day setup");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const columns: ColumnDef<ILeaveDaySetup>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "days",
      header: "Days",
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
          {getPermission("Leave_Day_Setup", "update") && (
            <Button variant="outline" className="bg-gray-100" size="icon" onClick={() => handleEdit(row.original)}>
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Leave_Day_Setup", "delete") && (
            <Button variant="outline" className="bg-gray-100 text-red-400" size="icon" onClick={() => handleDeleteClick(row.original)}>
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
        <HomeLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">Error loading leave day setup.</div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      <ReusableTableHeader
        title="Leave Day Setup"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Leave_Day_Setup", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={<CreateEditLeaveDaySetupModal onClose={handleModalClose} editing={editingItem} />}
        modalTitle={editingItem ? "Edit Leave Day Setup" : "Create Leave Day Setup"}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Row per page</span>
          <Select value={String(rowsPerPage)} onValueChange={(val) => handleRowsPerPageChange(Number(val))}>
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
        <ReusableTable<ILeaveDaySetup>
          columns={columns}
          data={rows}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={leaveData?.meta?.total || 0}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            name: 2,
            price: 3,
            createdAt: 4,
            id: 5,
          }}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={itemToDelete?.name}
        itemType="leaveDaySetup"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LeaveDaySetupList;
