import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FaEye, FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Heading from "@/components/typography/Heading";
import { ReusableTable } from "@/components/common/ReusableTable";
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

import { Plus } from "lucide-react";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";
import {
  useDeletePurchaseReturnMutation,
  useGetAllPurchaseReturnQuery,
} from "@/components/store/api/purchase/purchaseReturnApi";
import ViewPurchaseReturn from "./ViewPurchaseReturn";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";

interface PurchaseReturnType {
  id: number;
  challanNo: string;
  date: string;
  purchaseId: number;
  totalAmount: number;
  totalPaymentAmount: number;
  supplier: {
    companyName: string;
    accountType: string;
    email: string;
    mobileNumber: string;
    address: string;
    balance: number;
  };
  account: {
    accountType: string;
    companyName: string;
    email: string;
    mobileNumber: string;
    balance: number;
  };
  PurchaseReturnProduct: Array<{
    id: number;
    quantity: number;
    damageQuantity: number;
    unitPrice: number;
    subTotal: number;
    productVariation: {
      color: { name: string };
      size: { name: string };
      product: {
        name: string;
        image: string;
        brand: { name: string };
        category: { name: string };
        subCategory: { name: string };
        unit: { name: string };
      };
    };
  }>;
}

export default function PurchaseReturn() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] =
    useState<PurchaseReturnType | null>(null);
  const currentCurrency = useSelector(selectCurrentCurrency);

  const {
    data: returnList,
    isLoading,
    refetch,
  } = useGetAllPurchaseReturnQuery({
    page: page + 1,
    size: rowsPerPage,
    search,
  });

  const tableData = returnList?.data ?? [];
  const totalItems = returnList?.meta?.total ?? 0;

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<any>(null);
  const [deletePurchaseReturn, { isLoading: deleteLoading }] =
    useDeletePurchaseReturnMutation();

  const handleDeleteConfirm = async () => {
    try {
      await deletePurchaseReturn(selectedDeleteItem.id).unwrap();
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
    setPage(0);
  };

  // Table columns
  const purchaseReturnColumns: ColumnDef<any>[] = [
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
    { accessorKey: "supplier.accountType", header: "Account Type" },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) =>
        `${currentCurrency.name} ${row.original.totalAmount.toFixed(2)}`,
    },
    {
      accessorKey: "totalPaymentAmount",
      header: "Total Payment Amount",
      cell: ({ row }) =>
        `${currentCurrency.name} ${row.original.totalPaymentAmount.toFixed(2)}`,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
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
              className="bg-gray-100"
              size="icon"
              onClick={() => {
                setSelectedReturn(item);
                setIsViewModalOpen(true);
              }}
            >
              <FaEye />
            </Button>

            <Button
              variant="outline"
              className="bg-gray-100"
              size="icon"
              onClick={() => navigate(`/create-purchase-return?id=${item.id}`)}
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
        {/* Header */}
        <ReusableTableHeader
          title="Purchase Return List"
          searchTerm={search}
          onSearchChange={setSearch}
          onSearchReset={() => setPage(1)}
          hasCreatePermission={getPermission("Purchase_Return", "create")}
          createButtonLabel="Create"
          createButtonIcon={<Plus size={20} />}
          createButtonLink="/create-purchase-return"
          searchPlaceholder="Search by challan no or purchase ID"
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

        {/* Table */}
        <ReusableTable
          columns={purchaseReturnColumns}
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
        itemType="purchase return"
        itemName={selectedDeleteItem?.challanNo}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
      />

      {/* View modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex flex-col h-full">
            <Heading>Purchase Return Details</Heading>

            <div className="flex-1 overflow-auto bg-gray-50/50">
              <ViewPurchaseReturn purchaseReturnData={selectedReturn} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
