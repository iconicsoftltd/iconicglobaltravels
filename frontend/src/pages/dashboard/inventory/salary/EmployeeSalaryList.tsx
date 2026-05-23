import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { ReusableTable } from "@/components/common/ReusableTable";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import { IEmployeeSalary } from "@/schemas/admin/inventory/salary/employeeSalarySchema";
import { useDeleteEmployeeSalaryMutation, useGetAllEmployeeSalariesQuery } from "@/components/store/api/inventory/salary/employeeSalaryApi";
import CreateEmployeeSalaryModel from "@/components/common/modals/CreateEmployeeSalaryModal";

const EmployeeSalaryList = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, 
    // setRowsPerPage
  ] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<IEmployeeSalary | null>(
    null
  );
  const [salaryToDelete, setSalaryToDelete] =
    useState<IEmployeeSalary | null>(null);

  const { data, refetch } = useGetAllEmployeeSalariesQuery({
    page,
    size: rowsPerPage,
    search: searchTerm,
  });

  const [deleteSalary, { isLoading: isDeleting }] =
    useDeleteEmployeeSalaryMutation();

  const salaryList = useMemo(() => data?.data || [], [data]);

  const columns: ColumnDef<IEmployeeSalary>[] = [
    { accessorKey: "employeeId", header: "Employee" },
    { accessorKey: "month", header: "Month" },
    { accessorKey: "year", header: "Year" },
    { accessorKey: "grossSalary", header: "Gross Salary" },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setEditingSalary(row.original);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="text-red-500"
            onClick={() => setSalaryToDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!salaryToDelete) return;
    try {
      await deleteSalary(salaryToDelete.id).unwrap();
      toast.success("Salary deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete salary");
    } finally {
      setSalaryToDelete(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <ReusableTableHeader
        title="Employee Salary"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalTitle={editingSalary ? "Edit Salary" : "Create Salary"}
        modalContent={
          <CreateEmployeeSalaryModel
            onClose={() => {
              setIsModalOpen(false);
              setEditingSalary(null);
            }}
            editingSalary={editingSalary}
          />
        }
      />

      <ReusableTable
        columns={columns}
        data={salaryList}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={rowsPerPage}
        totalItems={data?.meta?.total}
      />

      <DeleteConfirmModal
        open={!!salaryToDelete}
        onOpenChange={() => setSalaryToDelete(null)}
        itemName="salary"
        itemType="salary"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default EmployeeSalaryList;
