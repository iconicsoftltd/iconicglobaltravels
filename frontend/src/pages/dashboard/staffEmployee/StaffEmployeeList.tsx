import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import CreateStaffEmployeeModel from "../../../components/common/modals/CreateStaffEmployeeModel";
import { Link } from "react-router-dom";
import {
  useGetAllEmployeesQuery,
  useDeleteEmployeeMutation,
} from "@/components/store/api/employee/employeeApi";

import getPermission from "@/utils/helper/getPermission";
import { IEmployee } from "@/schemas/admin/employee/employeeSchema";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import HomeLoader from "@/components/loader/HomeLoader";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const StaffEmployeeList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null,
  );

  const [employeeToDelete, setEmployeeToDelete] = useState<IEmployee | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: employeeData,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
    refetch,
  } = useGetAllEmployeesQuery({
    search: searchTerm,
    page: page,
    size: rowsPerPage,
  });
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  // Table Data Transformation
  const employeeList = useMemo(() => {
    if (!employeeData?.data) return [];
    return employeeData.data.map((emp: IEmployee) => ({
      ...emp,

      joinDateDisplay: new Date(emp.joiningDate).toLocaleDateString(),
      salaryDisplay: emp.salary?.toLocaleString(),
      statusDisplay: emp.isActive ? "Active" : "Inactive",
    }));
  }, [employeeData]);

  const filteredData = employeeList.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Row Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedRows(filteredData.map((emp) => emp.id));
    else setSelectedRows([]);
  };
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) setSelectedRows((prev) => [...prev, id]);
    else setSelectedRows((prev) => prev.filter((item) => item !== id));
  };
  const allSelected =
    filteredData.length > 0 &&
    filteredData.every((emp) => selectedRows.includes(emp.id));

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  const handleModalClose = () => {
    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  // Open delete modal
  const handleDeleteClick = (employee: IEmployee) => {
    setEmployeeToDelete(employee);
    setIsDeleteOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id).unwrap();
      toast.success("Employee deleted successfully");
      refetch();
      setSelectedRows((prev) =>
        prev.filter((item) => item !== employeeToDelete.id),
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete employee");
    } finally {
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Table Columns
  const columns: ColumnDef<IEmployee>[] = [
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
      accessorKey: "image",
      header: "Photo",
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-10 h-10 rounded-full object-cover border"
        />
      ),
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "joinDateDisplay", header: "Join Date" },
    { accessorKey: "salaryDisplay", header: "Salary" },
    {
      accessorKey: "statusDisplay",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            row.original.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-3">
          <Link to={`/staff-employee/${row.original.id}`}>
            <Button
              variant="outline"
              className="bg-gray-100 text-gray-600"
              size="icon"
            >
              <FaEye />
            </Button>
          </Link>

          {getPermission("Employee", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100 text-gray-600"
              size="icon"
              onClick={() => {
                setEditingEmployee(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("Employee", "delete") && (
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

  if (isEmployeeLoading) return <HomeLoader />;
  if (isEmployeeError)
    return (
      <div className="text-center text-red-500 p-8">Error loading Employee</div>
    );

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Staff Employee List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Employee", "create")}
        onModalClose={handleModalClose}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateStaffEmployeeModel
            onClose={handleModalClose}
            editingEmployee={editingEmployee || undefined}
          />
        }
        modalWidthCls="sm:max-w-[1000px]"
        modalTitle={editingEmployee ? "Edit Employee" : "Create Employee"}
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
        <ReusableTable<IEmployee>
          columns={columns}
          data={filteredData}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={employeeData?.meta?.total}
          setCurrentPage={setPage}
          columnPriority={{
            actions: 1,
            name: 2,
            email: 3,
            phone: 4,
            statusDisplay: 5,
            image: 6,
            address: 7,
            joinDateDisplay: 8,
            salaryDisplay: 9,
            id: 10,
            select: 11,
          }}
        />
      </div>

      {/* Reusable Delete Modal */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={employeeToDelete?.name}
        itemType="employee"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default StaffEmployeeList;
