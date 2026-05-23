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
import Heading from "@/components/typography/Heading";
import toast from "react-hot-toast";
import {
  useDeleteQuotationsMutation,
  useGetAllQuotationsQuery,
} from "@/components/store/api/quotation/quotationApi";

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
import ViewQuotationModal from "./ViewQuotationModal";

interface QuotationType {
  id: number;
  branchId: number;
  date: string;
  invoiceNo: string;
  customerId: number;
  totalAmount: number;
  vat: number;
  tc: number;
  discount: number;
  customer: {
    accountType: string;
  };
  createdAt: string;
  updatedAt: string;
  QuotationProduct?: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    productVariation: {
      product: {
        name: string;
        category: {
          name: string;
        };
        unit: {
          name: string;
        };
      };
      size: {
        name: string;
      };
      color: {
        name: string;
      };
    };
  }>;
}

const QuotationList: React.FC = () => {
  // State Management
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] =
    useState<QuotationType | null>(null);
  const currentCurrency = useSelector(selectCurrentCurrency);

  // API Hooks
  const {
    data: quotationsData,
    isLoading,
    error,
    refetch,
  } = useGetAllQuotationsQuery({
    page,
    size: rowsPerPage,
    search: searchTerm,
  });

  const [deleteQuotation, { isLoading: isDeleting }] =
    useDeleteQuotationsMutation();

  // Extract data from API response
  const quotations = quotationsData?.data || [];
  const totalItems = quotationsData?.totalCount || 0;

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  // Handle delete button click
  const handleDeleteClick = (quotation: QuotationType) => {
    setQuotationToDelete(quotation);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual delete confirmation
  const handleDeleteConfirm = async () => {
    if (!quotationToDelete) return;

    try {
      await deleteQuotation(quotationToDelete.id).unwrap();
      toast.success("Quotation deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete quotation");
      console.error("Delete error:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setQuotationToDelete(null);
    }
  };

  const [openView, setOpenView] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(
    null,
  );
  const handleView = (id: number) => {
    setSelectedQuotationId(id);
    setOpenView(true);
  };

  // Columns
  const columns: ColumnDef<QuotationType>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => (page - 1) * rowsPerPage + row.index + 1,
    },
    {
      accessorKey: "invoiceNo",
      header: "Quotation No",
    },
    {
      accessorKey: "date",
      header: "Quotation Date",
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
      cell: ({ row }) =>
        `${currentCurrency.name} ${row.original.totalAmount?.toFixed(2) || "0.00"}`,
    },
    {
      accessorKey: "vat",
      header: "VAT (%)",
      cell: ({ row }) => `${row.original.vat || 0}%`,
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) =>
        `${currentCurrency.name} ${row.original.discount?.toFixed(2) || "0.00"}`,
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
              onClick={() => navigate(`/quotation?id=${item.id}`)}
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
          Error loading quotations. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen space-y-4">
      <ReusableTableHeader
        title="Quotation List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(1)}
        hasCreatePermission={getPermission("Quotation", "create")}
        createButtonLink="/quotation"
        createButtonLabel={"Create Quotation"}
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
        <ReusableTable<QuotationType>
          columns={columns}
          data={quotations}
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
        itemName={quotationToDelete?.invoiceNo}
        itemType="quotation"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <Heading>Quotation Details</Heading>
          </DialogHeader>
          {selectedQuotationId && (
            <ViewQuotationModal quotationId={selectedQuotationId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationList;
