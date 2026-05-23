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
import CreateEditServiceModal from "../../../../components/common/modals/CreateEditServiceModal";
import toast from "react-hot-toast";


import getPermission from "@/utils/helper/getPermission";
import HomeLoader from "@/components/loader/HomeLoader";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { useDeleteServiceMutation, useGetAllServiceQuery } from "@/components/store/api/service/serviceApi";
import { timeDateFormatter } from "@/utils/helper/timeDateFormatter";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";

interface ServiceType {
  id: number;
  branchId: number;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const ServiceList: React.FC = () => {
  // State Management
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceType | null>(null);
  const currentCurrency = useSelector(selectCurrentCurrency);

  // API Hooks
  const {
    data: servicesData,
    isLoading,
    error,
    refetch,
  } = useGetAllServiceQuery(
    {
      page,
      size: rowsPerPage,
      search: searchTerm,
    },
  );

  const [deleteService, { isLoading: isDeleting }] =
    useDeleteServiceMutation();

  // Extract data from API response
  const services = servicesData?.data || [];
  const totalItems = servicesData?.meta?.total || 0;

  // Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = services.map((item) => item.id);
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
    services.length > 0 &&
    services.every((item) => selectedRows.includes(item.id));

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when rows per page changes
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingService(null);
    refetch(); // Refetch data after modal closes to get updated list
  };

  // Handle edit service
  const handleEdit = (service: ServiceType) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  // Handle delete button click - open dialog
  const handleDeleteClick = (service: ServiceType) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService(serviceToDelete.id).unwrap();
      toast.success("Service deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete service");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };


  // Columns
  const columns: ColumnDef<ServiceType>[] = [
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
      accessorKey: "name",
      header: "Service Name",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `${currentCurrency.name} ${row.original.price}`
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "N/A",
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
          {getPermission("Service", "update") && (
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => handleEdit(row.original)}
            >
              <FaRegEdit />
            </Button>
          )}

          {getPermission("Service", "delete") && (
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
  if (isLoading) {
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
          Error loading services. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Service List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Service", "create")}
        onModalClose={handleModalClose}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        createButtonLabel={"Create Service"}
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <CreateEditServiceModal
            onClose={handleModalClose}
            editingService={editingService}
          />
        }
        modalTitle={editingService ? "Edit Service" : "Create Service"}
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
        <ReusableTable<ServiceType>
          columns={columns}
          data={services}
          columnPriority={{
            actions: 1,
            name: 2,
            price: 3,
            description: 4,
            createdAt: 5,
            id: 6,
            select: 7,
          }}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          setCurrentPage={setPage}
        />
      </div>

      <DeleteConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={serviceToDelete?.name}
        itemType="service"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ServiceList;