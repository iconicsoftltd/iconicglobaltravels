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
import Heading from "@/components/typography/Heading";
import toast from "react-hot-toast";

import getPermission from "@/utils/helper/getPermission";
import HomeLoader from "@/components/loader/HomeLoader";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import { useNavigate } from "react-router-dom";
import { timeDateFormatter } from "@/utils/helper/timeDateFormatter";
import { FaEye } from "react-icons/fa6";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import ViewServiceSales from "./ViewServiceSales";
import {
  useDeleteServiceSalesMutation,
  useGetAllServiceSalesQuery,
} from "@/components/store/api/inventory/serviceSales/serviceSalesApi";

interface SalesType {
  id: number;
  branchId: number;
  date: string;
  invoiceNo: string;
  customerId: number;
  paymentAccountId: number;
  totalAmount: number;
  totalPaymentAmount: number;
  dueAmount: number;
  customer: {
    accountType: string;
  };
  vat: number;
  tc: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

const ServiceSalesList: React.FC = () => {
  // State Management
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<SalesType | null>(null);
  const currentCurrency = useSelector(selectCurrentCurrency);

  // API Hooks
  const {
    data: serviceSalesData,
    isLoading,
    error,
    refetch,
  } = useGetAllServiceSalesQuery({
    page,
    size: rowsPerPage,
    search: searchTerm,
  });

  const [deleteSale, { isLoading: isDeleting }] =
    useDeleteServiceSalesMutation();

  // Extract data from API response
  const sales = serviceSalesData?.data || [];
  const totalItems = serviceSalesData?.totalCount || 0;

  // Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = sales.map((item) => item.id);
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
    sales.length > 0 && sales.every((item) => selectedRows.includes(item.id));

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when rows per page changes
  };

  // Handle delete button click - open dialog
  const handleDeleteClick = (sale: SalesType) => {
    setSaleToDelete(sale);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!saleToDelete) return;

    try {
      await deleteSale(saleToDelete.id).unwrap();
      toast.success("Sale deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete sale");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  const [openView, setOpenView] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // Your existing code...

  const handleView = (id: number) => {
    setSelectedSaleId(id);
    setOpenView(true);
  };

  // Columns
  const columns: ColumnDef<SalesType>[] = [
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
      accessorKey: "invoiceNo",
      header: "Invoice No",
    },
    {
      accessorKey: "date",
      header: "Sale Date",
      cell: ({ row }) => timeDateFormatter(row.original.date),
    },
    {
      accessorKey: "customer.accountType",
      header: "Customer Name",
      cell: ({ row }) => row.original.customer?.accountType || "-",
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => `${currentCurrency.name} ${row.original.totalAmount}`,
    },
    {
      accessorKey: "totalPaymentAmount",
      header: "Payment Amount",
      cell: ({ row }) =>
        `${currentCurrency.name} ${row.original.totalPaymentAmount}`,
    },
    {
      accessorKey: "dueAmount",
      header: "Due Amount",
      cell: ({ row }) => `${currentCurrency.name} ${row.original.dueAmount}`,
    },
    {
      accessorKey: "vat",
      header: "VAT (%)",
      cell: ({ row }) => `${row.original.vat}%`,
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => `${currentCurrency.name} ${row.original.discount}`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleView(item.id)}
            >
              <FaEye className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => navigate(`/service-sales?id=${item.id}`)}
            >
              <FaRegEdit />
            </Button>

            <Button
              variant="outline"
              className="bg-gray-100 text-red-400"
              size="icon"
              onClick={() => handleDeleteClick(row.original)}
            >
              <FaTrashAlt />
            </Button>
          </div>
        );
      },
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
          Error loading sales. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      <ReusableTableHeader
        title="Service Sales List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Service_Sales", "create")}
        createButtonLink="/service-sales"
        createButtonLabel={"Create"}
        createButtonIcon={<Plus size={20} />}
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
        <ReusableTable<SalesType>
          columns={columns}
          data={sales}
          columnPriority={{
            invoiceNo: 1,
            date: 2,
            customerId: 3,
            totalAmount: 4,
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
        itemName={saleToDelete?.invoiceNo}
        itemType="sale"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <Heading>Service Sales Details</Heading>
          </DialogHeader>
          {selectedSaleId && <ViewServiceSales saleId={selectedSaleId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceSalesList;
