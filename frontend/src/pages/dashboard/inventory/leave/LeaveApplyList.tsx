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
// import CreateEditLeaveApplyModal from "@/components/common/modals/CreateEditLeaveApplyModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import {
  useDeleteLeaveApplyMutation,
  useGetAllLeaveApplyQuery,
} from "@/components/store/api/inventory/leave/leaveApplyApi";
import { ILeaveApply } from "@/schemas/admin/inventory/leave/leaveApplySchema";
import CreateLeaveApplyModal from "@/components/common/modals/CreateLeaveApplyModal";
import EditLeaveApplyModal from "@/components/common/modals/EditLeaveApplyModal";

const LeaveApplyList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ILeaveApply | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ILeaveApply | null>(null);

  const {
    data: leaveApplyData,
    isLoading,
    error,
    refetch,
  } = useGetAllLeaveApplyQuery(
    { page, size: rowsPerPage, search: searchTerm },
  );

  const [deleteLeaveApply, { isLoading: isDeleting }] =
    useDeleteLeaveApplyMutation();

  const rows: ILeaveApply[] = leaveApplyData?.data || [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    refetch();
  };

  const handleEdit = (item: ILeaveApply) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: ILeaveApply) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await deleteLeaveApply(itemToDelete.id).unwrap();
      toast.success("Leave apply deleted successfully");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete leave apply");
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const columns: ColumnDef<ILeaveApply>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "employee.name",
      header: "Employee",
    },
    {
      accessorKey: "subject",
      header: "Subject",
    },
    {
      accessorKey: "fromDays",
      header: "From",
      cell: ({ getValue }) =>
        getValue() ? String(getValue()).split("T")[0] : "",
    },
    {
      accessorKey: "toDays",
      header: "To",
      cell: ({ getValue }) =>
        getValue() ? String(getValue()).split("T")[0] : "",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => timeDateFormatter(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-4 justify-left">
          {getPermission("Leave_Apply", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Leave_Apply", "delete") && (
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
        <HomeLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          Error loading leave applies.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      <ReusableTableHeader
        title="Leave Apply List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Leave_Apply", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel={"Crate"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          editingItem ? (
            <EditLeaveApplyModal
              onClose={handleModalClose}
              defaultValues={editingItem}
              open={editingItem !== null}
            />
          ) : (
            <CreateLeaveApplyModal onClose={handleModalClose} />
          )
        }
        modalTitle={editingItem ? "Update Leave Apply" : "Crate Apply Leave"}
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

      <div className="space-y-4">
        <ReusableTable<ILeaveApply>
          columns={columns}
          data={rows}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={leaveApplyData?.meta?.total || 0}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            subject: 2,
            employeeId: 3,
            createdAt: 4,
            id: 5,
          }}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={itemToDelete?.subject}
        itemType="leaveApply"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LeaveApplyList;
