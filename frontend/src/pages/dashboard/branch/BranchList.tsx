import { ReusableTable } from "@/components/common/ReusableTable";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import HomeLoader from "@/components/loader/HomeLoader";
import {
  useDeleteBranchMutation,
  useGetBranchAllQuery,
  useUpdateBranchMutation,
} from "@/components/store/api/branch/branchApi";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import getPermission from "@/utils/helper/getPermission";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import CreateBranchModel from "../../../components/common/modals/CreateBranchModel";

interface BranchType {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

const BranchList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<BranchType | null>(null);

  const { data, isLoading, error, refetch } = useGetBranchAllQuery({
    page,
    size: rowsPerPage,
    search: searchTerm,
  });

  const [deleteBranch] = useDeleteBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();

  const branches = data?.data || [];
  const totalItems = data?.meta?.total || 0;

  const handleRowsPerPageChange = (val: number) => {
    setRowsPerPage(val);
    setPage(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    refetch();
  };

  const handleUpdateBranchStatus = async (branch: BranchType, isActive: boolean) => {
    try {
      await updateBranch({ ...branch, isActive }).unwrap();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;

    try {
      await deleteBranch(branchToDelete.id).unwrap();
      toast.success("Deleted successfully");
      refetch();
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  const columns: ColumnDef<BranchType>[] = [
    {
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    { accessorKey: "name", header: "Company" },
    { accessorKey: "address", header: "Address" },
    {
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Switch
            checked={row.original.isActive}
            onCheckedChange={(v) => handleUpdateBranchStatus(row.original, v)}
          />
        </div>
      ),
    },
    {
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {getPermission("Branch", "update") && (
            <Button
              size="icon"
              variant="outline"
              className="hover:bg-blue-50"
              onClick={() => {
                setEditingBranch(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("Branch", "delete") && (
            <Button
              size="icon"
              variant="outline"
              className="hover:bg-red-50 text-red-500"
              onClick={() => {
                setBranchToDelete(row.original);
                setIsDeleteDialogOpen(true);
              }}
            >
              <FaTrashAlt />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <HomeLoader />;

  if (error) {
    return <div className="text-center text-red-500">Something went wrong</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <ReusableTableHeader
        title="Company List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Branch", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={18} />}
        modalTitle={editingBranch ? "Edit Company" : "Create Company"}
        modalContent={
          <CreateBranchModel
            onClose={handleModalClose}
            editingBranch={editingBranch}
          />
        }
      />

      {/* Filters */}
      <div className="flex justify-between items-center bg-white border rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          Rows:
          <Select
            value={String(rowsPerPage)}
            onValueChange={(v) => handleRowsPerPageChange(Number(v))}
          >
            <SelectTrigger className="w-[80px] h-8">
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

        <p className="text-xs text-gray-400">
          Total: {totalItems} items
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm p-3">
        <ReusableTable
          columns={columns}
          data={branches}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          setCurrentPage={setPage}
        />
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <Heading className="text-red-600 font-semibold">
              Confirm Delete
            </Heading>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Delete <strong>{branchToDelete?.name}</strong>? This cannot be undone.
          </p>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchList;