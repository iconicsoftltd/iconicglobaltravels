import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";
import toast from "react-hot-toast";
import { DeleteConfirmModal } from "@/components/common/modals/DeleteConfirmModal";
import AddEditProductModal from "@/components/common/modals/AddEditProductModal";


import getPermission from "@/utils/helper/getPermission";
import { IProduct } from "@/schemas/admin/inventory/productSchema";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useUpdateProductMutation,
} from "@/components/store/api/inventory/productApi";
import ReusableTableHeader from "@/components/common/ReusableTableHeader";

const ProductsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- API Hooks ---
  const {
    data: productData,
    refetch,
    isLoading,
  } = useGetAllProductsQuery({
    search: searchTerm,
    page: page + 1,
    size: rowsPerPage,
  });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = productData?.data ?? [];

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleModalClose = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  // --- CRUD Handlers ---
  const handleCreateProduct = async (data: any) => {
    try {
      await createProduct(data).unwrap();
      toast.success("Product created successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create product");
    }
  };

  const handleUpdateProduct = async (id: number, data: any) => {
    try {
      await updateProduct({ id, data }).unwrap();
      toast.success("Product updated successfully");
      refetch();
      handleModalClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update product");
    }
  };

  const handleDeleteClick = (product: IProduct) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id).unwrap();
      toast.success("Product deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleteOpen(false);
      setProductToDelete(null);
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<IProduct>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => row.index + 1 + page * rowsPerPage,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) =>
        row.original.image ? (
          <img
            src={row.original.image}
            alt={row.original.name}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          "-"
        ),
    },
    { accessorKey: "name", header: "Name" },

    {
      accessorKey: "branchId",
      header: "Company",
      cell: ({ row }) => row.original.branch?.name || "-",
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => row.original.category?.name || "-",
    },
    {
      accessorKey: "subCategoryId",
      header: "SubCategory",
      cell: ({ row }) => row.original.subCategory?.name || "-",
    },
    {
      accessorKey: "unitId",
      header: "Unit",
      cell: ({ row }) => row.original.unit?.name || "-",
    },
    {
      accessorKey: "brandId",
      header: "Brand",
      cell: ({ row }) => row.original.brand?.name || "-",
    },

    { accessorKey: "productCode", header: "Code" },

    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-3">
          {getPermission("Product", "update") && (
            <Button
              size="icon"
              variant="outline"
              className="bg-gray-100"
              onClick={() => {
                setEditingProduct(row.original);
                setIsModalOpen(true);
              }}
            >
              <FaRegEdit />
            </Button>
          )}
          {getPermission("Product", "delete") && (
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
        title="Product List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchReset={() => setPage(0)}
        hasCreatePermission={getPermission("Product", "create")}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onModalClose={handleModalClose}
        createButtonLabel="Create"
        createButtonIcon={<Plus size={20} />}
        modalWidthCls="sm:max-w-[900px]"
        modalContent={
          <AddEditProductModal
            onClose={handleModalClose}
            editingProduct={editingProduct}
            onCreate={handleCreateProduct}
            onUpdate={handleUpdateProduct}
          />
        }
        modalTitle={editingProduct ? "Edit Product" : "Create Product"}
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
        <ReusableTable<IProduct>
          columns={columns}
          data={products}
          currentPage={page}
          itemsPerPage={rowsPerPage}
          totalItems={productData?.meta?.total}
          setCurrentPage={setPage}
          isLoading={isLoading}
          columnPriority={{
            actions: 1,
            name: 2,
            image: 3,
            branchId: 4,
            categoryId: 5,
            subCategoryId: 6,
            unitId: 7,
            brandId: 8,
            productCode: 9,
            id: 10,
          }}
        />
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={productToDelete?.name}
        itemType="product"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductsPage;
