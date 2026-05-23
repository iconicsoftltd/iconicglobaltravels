import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import toast from "react-hot-toast";

import getPermission from "@/utils/helper/getPermission";
import CreateUserModel from "../../../components/common/modals/CreateUserModel";
import HomeLoader from "@/components/loader/HomeLoader";
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
} from "@/components/store/api/user/userApi";
import { GrNotes } from "react-icons/gr";
import UserDetails from "./UserDetails";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface UserType {
  id: number;
  employeeId: number;
  password: string;
  roleId: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: {
    name: string;
  };
  employee: {
    name: string;
  };
}

const UserList: React.FC = () => {
  // State Management
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [selectedRoleDetails, setSelectedRoleDetails] = useState<any | null>(
    null
  );

  // API Hooks
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetAllUsersQuery({
    page,
    size: rowsPerPage,
    search: searchTerm,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUserStatus, { isLoading: isUserStatusUpdating }] = useUpdateUserStatusMutation();

  // Extract data from API response
  const users = usersData?.data || [];
  const totalItems = usersData?.meta?.total || 0;

  // Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = users.map((item) => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((item) => item !== id));
    }
  };

  const allSelected =
    users.length > 0 && users.every((item) => selectedRows.includes(item.id));

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when rows per page changes
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    refetch(); // Refetch data after modal closes to get updated list
  };

  // Handle edit user
  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Handle delete button click - open dialog
  const handleDeleteClick = (user: UserType) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // handle update usre status
  const handleUpdateUserStatus = async (id) => {
    try {
      const result = await updateUserStatus(id).unwrap();
      if (result?.success) {
        toast.success(result?.message || "Status Updated Successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update states");
    }
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id).unwrap();
      toast.success("User deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Columns
  const columns: ColumnDef<UserType>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.includes(row.original.id)}
          onCheckedChange={(checked) =>
            handleSelectOne(row.original.id, checked as boolean)
          }
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "employee.name",
      header: "Employee Name",
    },
    {
      accessorKey: "role.name",
      header: "Role",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const switchId = `status-switch-${row.original.id}`;
        return (
          <div className="flex items-center space-x-2 justify-center">
            <Switch
              id={switchId}
              checked={row.original.isActive}
              onCheckedChange={() => handleUpdateUserStatus(row.original.id)}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "isVerified",
      header: "Is Verified",
      cell: ({ row }) => {
        const isVerified = row.original.isVerified;

        return (
          <div className="flex justify-center">
            {isVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="destructive">Unverified</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-4 justify-left">
          {getPermission("User", "read") && (
            <Button
              variant="outline"
              className="bg-gray-100 text-blue-500"
              size="icon"
              onClick={() => setSelectedRoleDetails(row.original)}
            >
              <GrNotes />
            </Button>
          )}
          {getPermission("User", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("User", "delete") && (
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
  if (isLoading || isUserStatusUpdating) {
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
          Error loading users. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="User List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("User", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateUserModel
            onClose={handleModalClose}
            editingUser={editingUser || undefined}
          />
        }
        modalTitle={editingUser ? "Edit User" : "Create User"}
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
        <ReusableTable<UserType>
          columns={columns}
          data={users}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            "employee.name": 2,
            "role.name": 3,
            createdAt: 4,
            isActive: 5,
            id: 6,
            select: 7,
          }}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={userToDelete?.employee?.name}
        itemType="ledger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Role Details Dialog */}
      <Dialog
        open={!!selectedRoleDetails}
        onOpenChange={() => setSelectedRoleDetails(null)}
      >
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <UserDetails role={selectedRoleDetails} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserList;
