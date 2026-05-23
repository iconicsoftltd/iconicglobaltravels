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
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditGroupModel from "@/components/common/modals/AddEditGroupModal";
import { IGroup } from "@/schemas/admin/group/groupSchema";

import {
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useGetAllGroupsQuery,
  useUpdateGroupMutation,
} from "@/components/store/api/group/groupApi";
import HomeLoader from "@/components/loader/HomeLoader";
import getPermission from "@/utils/helper/getPermission";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const GroupsList: React.FC = () => {
  // --- State Management ---
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<IGroup | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: groupData,
    refetch,
    isLoading: isGroupLoading,
    isError: isGroupError,
  } = useGetAllGroupsQuery({
    search: searchTerm,
    page: page,
    size: rowsPerPage,
  });

  const [createGroup] = useCreateGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();

  const groups = groupData?.data ?? [];
  const totalItems = groupData?.meta?.total ?? groups.length;

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleModalClose = () => {
    setEditingGroup(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateGroup = async (data: any) => {
    try {
      await createGroup(data).unwrap();
      toast.success("Group created successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create group");
    }
  };

  const handleUpdateGroup = async (id: number, data: any) => {
    try {
      await updateGroup({ id, data }).unwrap();
      toast.success("Group updated successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update group");
    }
  };

  const handleDeleteClick = (group: IGroup) => {
    setGroupToDelete(group);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;
    try {
      await deleteGroup(groupToDelete.id).unwrap();
      toast.success("Group deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete group");
    } finally {
      setIsDeleteOpen(false);
      setGroupToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<IGroup>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    { accessorKey: "account", header: "Account" },
    { accessorKey: "accountType", header: "Group Name" },
    { accessorKey: "code", header: "Code" },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-3">
          {getPermission("Group", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100 text-gray-600"
              size="icon"
              onClick={() => {
                setEditingGroup(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Group", "delete") && (
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

  if (isGroupLoading) return <HomeLoader />;
  if (isGroupError)
    return (
      <div className="text-center text-red-500 p-8">Error loading Group</div>
    );

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Group Account List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Group", "create")}
        onModalClose={handleModalClose}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <AddEditGroupModel
            onClose={handleModalClose}
            editingGroup={editingGroup}
            onCreate={handleCreateGroup}
            onUpdate={handleUpdateGroup}
          />
        }
        modalTitle={editingGroup ? "Edit Group" : "Create Group"}
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
        <ReusableTable<IGroup>
          columns={columns}
          data={groups}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            account: 2,
            accountType: 3,
            code: 4,
            id: 5,
          }}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={groupToDelete?.accountType}
        itemType="group"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default GroupsList;
