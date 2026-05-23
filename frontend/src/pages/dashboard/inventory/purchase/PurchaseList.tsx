import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FaEye } from "react-icons/fa";
import Heading from "@/components/typography/Heading";
import { ReusableTable } from "@/components/common/ReusableTable";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import {
  useGetAllPurchaseQuery,
  useDeletePurchaseMutation,
} from "@/components/store/api/purchase/purchaseApi";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import { useNavigate } from "react-router-dom";
import getPermission from "@/utils/helper/getPermission";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import PurchaseDetails from "./ViewPurchase";
import { Plus } from "lucide-react";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";

interface PurchaseType {
  id: any;
  branchId: number;
  date: string; // ISO date
  challanNo: string;
  supplierId: number;
  paymentAccountId: number;
  totalPaymentAmount: number;
  totalAmount: number;
  dueAmount: number;
  vat?: number;
  tc?: number;
  products: {
    variationProductId: number;
    quantity: number;
    damageQuantity?: number;
    unitPrice: number;
  }[];
  discount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PurchaseList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0); // 0-based index
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const currentCurrency = useSelector(selectCurrentCurrency);

  const {
    data: purchaseList,
    isLoading,
    refetch,
  } = useGetAllPurchaseQuery({ page: page + 1, size: rowsPerPage, search });

  const tableData = purchaseList?.data ?? [];
  const totalItems = purchaseList?.meta?.total ?? 0;

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>(null);
  const [deletePurchase, { isLoading: deleteLoading }] =
    useDeletePurchaseMutation();

  const handleDeleteConfirm = async () => {
    try {
      await deletePurchase(selectedDeleteItem.id).unwrap();
      toast.success("Deleted successfully!");
      setDeleteModalOpen(false);
      refetch();
    } catch (error: any) {
      const message =
        error?.data?.message ?? error?.message ?? "Something went wrong";
      toast.error(String(message));
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setPage(0); // reset to first page
  };

  // Table columns
  const purchaseColumns: ColumnDef<PurchaseType>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      id: "sl",
      header: "SL",
      cell: ({ row }) => row.index + 1 + page * rowsPerPage,
    },
    { accessorKey: "challanNo", header: "Challan No" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => `${currentCurrency.name} ${row.original.totalAmount}`,
    },
    {
      accessorKey: "totalPaymentAmount",
      header: "Paid",
      cell: ({ row }) =>
        `${currentCurrency.name} ${row.original.totalPaymentAmount}`,
    },
    {
      accessorKey: "dueAmount",
      header: "Due",
      cell: ({ row }) => `${currentCurrency.name} ${row.original.dueAmount}`,
    },
    { accessorKey: "vat", header: "VAT (%)" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => {
                setSelectedPurchase(item); // Set the purchase to view
                setIsViewModalOpen(true); // Open modal
              }}
            >
              <FaEye />
            </Button>

            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => navigate(`/create-purchase?id=${item.id}`)}
            >
              <FaRegEdit />
            </Button>

            <Button
              variant="outline"
              className="bg-gray-100 text-red-400"
              size="icon"
              onClick={() => {
                setSelectedDeleteItem(item);
                setDeleteModalOpen(true);
              }}
            >
              <FaTrashAlt />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <section className="min-h-screen space-y-4 p-4">
        <ReusableTableHeader
          title="Purchase List"
          searchTerm={search}
          onSearchChange={setSearch}
          onSearchReset={() => setPage(1)}
          hasCreatePermission={getPermission("Purchase", "create")}
          createButtonLink="/create-purchase"
          createButtonLabel={"Create"}
          createButtonIcon={<Plus size={20} />}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 ">
          {/* Rows per page */}
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

        <ReusableTable
          columns={purchaseColumns}
          data={tableData}
          currentPage={page}
          setCurrentPage={setPage}
          itemsPerPage={rowsPerPage}
          totalItems={totalItems}
          isLoading={isLoading}
        />
      </section>

      {/* Delete modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        itemType="purchase"
        itemName={selectedDeleteItem?.challanNo}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
      />

      {/* The view modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex flex-col h-full">
            <Heading>Purchase Details</Heading>

            <div className="flex-1 overflow-auto bg-gray-50/50">
              <PurchaseDetails purchaseData={selectedPurchase} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
