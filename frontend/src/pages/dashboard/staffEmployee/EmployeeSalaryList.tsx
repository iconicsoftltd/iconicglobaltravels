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
import toast from "react-hot-toast";
import HomeLoader from "@/components/loader/HomeLoader";
import getPermission from "@/utils/helper/getPermission";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { ReusableTable } from "@/components/common/ReusableTable";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditEmployeeSalaryModal from "@/components/common/modals/AddEditEmployeeSalaryModal";
import { IEmployeeSalary } from "@/schemas/admin/employee/employeeSalarySchema";
import {
  useCreateEmployeeSalaryMutation,
  useDeleteEmployeeSalaryMutation,
  useGetAllEmployeeSalariesQuery,
  useUpdateEmployeeSalaryMutation,
} from "@/components/store/api/employee/employeeSalaryApi";
import { getMonthNameByNumber } from "@/utils/common/getMonthNameByNumber";

const EmployeeSalaryList: React.FC = () => {
  // --- State Management ---
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<IEmployeeSalary | null>(
    null
  );
  const [salaryToDelete, setSalaryToDelete] = useState<IEmployeeSalary | null>(
    null
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: salaryData,
    refetch,
    isLoading,
    isError,
  } = useGetAllEmployeeSalariesQuery({
    search: searchTerm,
    page,
    size: rowsPerPage,
  });

  const [createSalary] = useCreateEmployeeSalaryMutation();
  const [updateSalary] = useUpdateEmployeeSalaryMutation();
  const [deleteSalary, { isLoading: isDeleting }] =
    useDeleteEmployeeSalaryMutation();

  const salaries = salaryData?.data ?? [];
  const totalItems = salaryData?.meta?.total ?? salaries.length;

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setPage(1);
  };

  const handleModalClose = () => {
    setEditingSalary(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateSalary = async (data: any) => {
    try {
      await createSalary(data).unwrap();
      refetch();
      handleModalClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create salary");
    }
  };

  const handleUpdateSalary = async (id: number, data: any) => {
    try {
      await updateSalary({ id, data }).unwrap();
      refetch();
      handleModalClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update salary");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!salaryToDelete) return;
    try {
      await deleteSalary(salaryToDelete.id).unwrap();
      toast.success("Salary deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete salary");
    } finally {
      setIsDeleteOpen(false);
      setSalaryToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<IEmployeeSalary>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    { accessorKey: "employee.accountType", header: "Employee" },
    { accessorKey: "grossSalary", header: "Gross Salary" },
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => (
        <span>{getMonthNameByNumber(row.original.month)}</span>
      ),
    },
    { accessorKey: "year", header: "Year" },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-3">
          {getPermission("Salary", "update") && (
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-100 text-gray-600"
              onClick={() => {
                setEditingSalary(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Salary", "delete") && (
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-100 text-red-400"
              onClick={() => {
                setSalaryToDelete(row.original);
                setIsDeleteOpen(true);
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
  if (isError)
    return (
      <div className="text-center text-red-500 p-8">
        Error loading Employee Salary
      </div>
    );

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Employee Salary List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Salary", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalTitle={editingSalary ? "Edit Salary" : "Create Salary"}
        modalContent={
          <AddEditEmployeeSalaryModal
            onClose={handleModalClose}
            editingSalary={editingSalary}
            onCreate={handleCreateSalary}
            onUpdate={handleUpdateSalary}
          />
        }
        modalWidthCls="sm:max-w-[1000px]"
      />

      {/* Filters */}
      <div className="flex items-center gap-2 text-sm text-gray-600 border rounded-lg px-3 py-2 bg-gray-50">
        <span>Rows per page</span>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(v) => handleRowsPerPageChange(Number(v))}
        >
          <SelectTrigger className="w-[70px] h-8">
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

      {/* Table */}
      <ReusableTable<IEmployeeSalary>
        columns={columns}
        data={salaries}
        currentPage={page}
        itemsPerPage={rowsPerPage}
        totalItems={totalItems}
        setCurrentPage={setPage}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName="salary"
        itemType="salary"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default EmployeeSalaryList;
