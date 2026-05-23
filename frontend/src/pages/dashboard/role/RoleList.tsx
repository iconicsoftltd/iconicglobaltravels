import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { FaRegEdit,  FaTrashAlt, FaEye } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {
  useDeleteRoleMutation,
  useGetAllRolesQuery,
} from "@/components/store/api/role/roleApi"; // <-- your API hooks


import getPermission from "@/utils/helper/getPermission";
import AddRole from "./AddRole";
import RoleDetails from "./RoleDetails";
import HomeLoader from "@/components/loader/HomeLoader";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

interface RoleType {
  id: number;
  branchId: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

const RoleList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleType | null>(null);
  const [selectedRoleDetails, setSelectedRoleDetails] =
    useState<RoleType | null>(null);

  // API
  const {
    data: rolesData,
    isLoading,
    error,
    refetch,
  } = useGetAllRolesQuery(
    { page, size: rowsPerPage, search: searchTerm },
  );

  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles = rolesData?.data || [];
  const totalItems = rolesData?.meta?.total || 0;

  // Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(roles.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedRows((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const allSelected =
    roles.length > 0 && roles.every((r) => selectedRows.includes(r.id));

  // Delete
  const handleDeleteClick = (role: RoleType) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id).unwrap();
      toast.success("Role deleted successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to delete role");
      console.error(err);
    } finally {
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleEdit = (role: RoleType) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    refetch();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const columns: ColumnDef<RoleType>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.includes(row.original.id)}
          onCheckedChange={(checked) =>
            handleSelectOne(row.original.id, checked as boolean)
          }
        />
      ),
    },
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    { accessorKey: "name", header: "Role Name" },
    {
      accessorKey: "isSystemRole",
      header: "System Role",
      cell: ({ row }) => (row.original.isSystemRole ? "Yes" : "No"),
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
        <div className="flex gap-2">
          {getPermission("Role", "read") && (
            <Button
              variant="outline"
              className="bg-gray-100 text-blue-500"
              size="icon"
              onClick={() => setSelectedRoleDetails(row.original)}
            >
              <FaEye />
            </Button>
          )}

          {getPermission("Role", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("Role", "delete") && !row?.original?.isSystemRole && (
            <Button
              variant="outline"
              className="bg-gray-100 text-red-500"
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

  if (isLoading) return <HomeLoader />;
  if (error)
    return (
      <div className="text-center text-red-500 p-8">Error loading roles</div>
    );

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Role List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Role", "create")}
        onModalClose={handleModalClose}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={18} />}
        modalContent={
          <AddRole onClose={handleModalClose} editingRole={editingRole} />
        }
        modalTitle={editingRole ? "Edit Role" : "Create Role"}
        modalWidthCls="sm:max-w-[1000px]"
      />

      {/* Filters */}
      <div className="flex justify-between items-center border p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(val) => {
              setRowsPerPage(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <ReusableTable<RoleType>
        columns={columns}
        data={roles}
        currentPage={page}
        itemsPerPage={rowsPerPage}
        totalItems={totalItems}
        setCurrentPage={setPage}
        columnPriority={{
          actions: 1,
          name: 2,
          isSystemRole: 3,
          createdAt: 4,
          id: 5,
          select: 6,
        }}
      />

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={roleToDelete?.name}
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
          <RoleDetails role={selectedRoleDetails} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleList;
