import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditProductVariationModal from "@/components/common/modals/AddEditProductVariationModal";


import getPermission from "@/utils/helper/getPermission";
import { IProductVariation } from "@/schemas/admin/inventory/productVariationSchema";
import {
  useCreateProductVariationMutation,
  useDeleteProductVariationMutation,
  useGetAllProductVariationsQuery,
  useUpdateProductVariationMutation,
} from "@/components/store/api/inventory/productVariationApi";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const ProductVariationsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariation, setEditingVariation] =
    useState<IProductVariation | null>(null);
  const [variationToDelete, setVariationToDelete] =
    useState<IProductVariation | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: variationData,
    refetch,
    isLoading,
  } = useGetAllProductVariationsQuery({
    search: searchTerm,
    page: page + 1,
    size: rowsPerPage,
  });

  const [createVariation] = useCreateProductVariationMutation();
  const [updateVariation] = useUpdateProductVariationMutation();
  const [deleteVariation, { isLoading: isDeleting }] =
    useDeleteProductVariationMutation();

  const variations = variationData?.data ?? [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleModalClose = () => {
    setEditingVariation(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateVariation = async (data: any) => {
    try {
      await createVariation(data).unwrap();
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create variation");
    }
  };

  const handleUpdateVariation = async (id: number, data: any) => {
    try {
      await updateVariation({ id, data }).unwrap();
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update variation");
    }
  };

  const handleDeleteClick = (variation: IProductVariation) => {
    setVariationToDelete(variation);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!variationToDelete) return;
    try {
      await deleteVariation(variationToDelete.id).unwrap();
      toast.success("Product Variation deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete variation");
    } finally {
      setIsDeleteOpen(false);
      setVariationToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<IProductVariation>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => row.index + 1 + page * rowsPerPage,
    },
    { accessorKey: "product.name", header: "Product" },
    { accessorKey: "size.name", header: "Size" },
    { accessorKey: "color.name", header: "Color" },
    { accessorKey: "salePrice", header: "Sale Price" },
    { accessorKey: "wholeSalePrice", header: "Wholesale Price" },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-3">
          {getPermission("Product_Variation", "update") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100"
              onClick={() => {
                setEditingVariation(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Product_Variation", "delete") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100 text-red-400"
              onClick={() => handleDeleteClick(row.original)}
            >
              <FaTrashAlt />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 min-h-screen space-y-4">
      {/* Header */}
      <ReusableTableHeader
        title="Product Variations"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(0)}
        hasCreatePermission={getPermission("Product_Variation", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalContent={
          <AddEditProductVariationModal
            onClose={handleModalClose}
            editingVariation={editingVariation}
            onCreate={handleCreateVariation}
            onUpdate={handleUpdateVariation}
          />
        }
        modalTitle={
          editingVariation
            ? "Edit Product Variation"
            : "Create Product Variation"
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
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
              {[5, 10, 15, 20].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <ReusableTable<IProductVariation>
          columns={columns}
          data={variations}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={variationData?.meta?.total}
          setCurrentPage={setPage}
          isLoading={isLoading}
          columnPriority={{
            actions: 1,
            "product.name": 2,
            "size.name": 3,
            "color.name": 4,
            salePrice: 5,
            wholeSalePrice: 6,
          }}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={`${variationToDelete?.product?.name} - ${variationToDelete?.size?.name} - ${variationToDelete?.color?.name}`}
        itemType="product variation"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductVariationsPage;
