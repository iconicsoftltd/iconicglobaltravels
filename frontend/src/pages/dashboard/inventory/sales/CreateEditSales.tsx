import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  useGetAllCustomerParticularQuery,
  useGetAllAccountsParticularQuery,
} from "@/components/store/api/particularAccount/particularAccountApi";
import {
  useCreateSalesMutation,
  useGetSalesByIdQuery,
  useUpdateSalesMutation,
} from "@/components/store/api/sales/salesApi";
import { requiredStar } from "@/utils/helper/requiredStar";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { GrNotes } from "react-icons/gr";
import { ReusableTable } from "@/components/common/ReusableTable";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Heading from "@/components/typography/Heading";
import CreateParticularAccountModal from "@/components/common/modals/CreateParticularAccountModal";
import { highlight } from "@/utils/helper/textHighlighter";
import {
  CreateEditSalesFormValues,
  createEditSalesSchema,
} from "@/schemas/admin/inventory/sales/createEditSalesSchema";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetAllProductVariationsQuery } from "@/components/store/api/inventory/productVariationApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateVoucherNo } from "@/utils/helper/randomValueGenerator";

type ProductRow = {
  id: number;
  variationProductId: number;
  product: string;
  type: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

export default function CreateEditSales() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const salesId = searchParams.get("id");
  const isEditMode = Boolean(salesId);

  const { data: editSales, isLoading: isLoadingSales } = useGetSalesByIdQuery(
    salesId ? Number(salesId) : 0,
    { skip: !salesId },
  );

  const selectedBranch = localStorage.getItem("selectedBranch");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEditSalesFormValues>({
    resolver: zodResolver(createEditSalesSchema),
    defaultValues: {
      date: new Date().toISOString(),
      invoiceNo: generateVoucherNo(
        "INV",
        selectedBranch ? JSON.parse(selectedBranch)?.name : "",
      ),
      customerId: undefined,
      paymentAccountId: undefined,
      totalPaymentAmount: 0,
      vat: 0,
      discount: 0,
      tc: 0,
      products: [],
    },
  });

  const [salesDate, setSalesDate] = useState<Date | undefined>(new Date());
  const [vat, setVat] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    "fixed",
  );
  const [paid, setPaid] = useState(0);
  const [paymentAccountId, setPaymentAccountId] = useState<
    number | undefined
  >();
  const [, setCustomerId] = useState<number | undefined>();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [editingParticular] = useState(null);

  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const [openCustomer, setOpenCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [openProduct, setOpenProduct] = useState(false);
  const [productname, setProductName] = useState("");

  const { data: customers } = useGetAllCustomerParticularQuery({});
  const { data: allAccounts } = useGetAllAccountsParticularQuery({});
  const { data: productData } = useGetAllProductVariationsQuery({});

  const [createSales, { isLoading: isCreating }] = useCreateSalesMutation();
  const [updateSales, { isLoading: isUpdating }] = useUpdateSalesMutation();
  const isLoading = isCreating || isUpdating;

  const [invoiceNo, setInvoiceNo] = useState<string>(
    generateVoucherNo(
      "INV",
      selectedBranch ? JSON.parse(selectedBranch)?.name : "",
    ),
  );

  // Watch form values
  const formValues = watch();

  useEffect(() => {
    if (isEditMode && editSales?.data) {
      const sale = editSales.data;

      setSalesDate(new Date(sale.date));
      setVat(sale.vat || 0);
      setDiscount(sale.discount || 0);
      setPaid(sale.totalPaymentAmount || 0);
      setCustomerId(sale.customerId);
      setPaymentAccountId(sale.paymentAccountId);
      setInvoiceNo(
        sale.invoiceNo ||
          generateVoucherNo(
            "INV",
            selectedBranch ? JSON.parse(selectedBranch)?.name : "",
          ),
      );

      // Set form values
      setValue("date", sale.date);
      setValue(
        "invoiceNo",
        sale.invoiceNo ||
          generateVoucherNo(
            "INV",
            selectedBranch ? JSON.parse(selectedBranch)?.name : "",
          ),
      );
      setValue("customerId", sale.customerId);
      setValue("paymentAccountId", sale.paymentAccountId);
      setValue("totalPaymentAmount", sale.totalPaymentAmount || 0);
      setValue("vat", sale.vat || 0);
      setValue("discount", sale.discount || 0);
      setValue("tc", sale.tc || 0);

      if (sale.customer) {
        setSelectedCustomer(sale.customer);
      }

      // ✅ Corrected SaleProduct mapping
      if (sale.SaleProduct && sale.SaleProduct.length > 0) {
        const productRows: ProductRow[] = sale.SaleProduct.map((item: any) => ({
          id: item.id,
          variationProductId: item.variationProductId,
          product: item.productVariation?.product?.name || "Unknown Product",
          type: item.productVariation?.product?.category?.name || "N/A",
          quantity: item.quantity,
          unit: item.productVariation?.product?.unit?.name || "Unit",
          unitPrice: item.unitPrice,
          totalPrice: item.subTotal,
        }));
        setRows(productRows);

        // Set form products
        setValue(
          "products",
          sale.SaleProduct.map((item: any) => ({
            variationProductId: item.variationProductId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        );

        // Set first product name for dropdown label
        const firstProduct = sale.SaleProduct[0]?.productVariation?.product;
        if (firstProduct) {
          setSelectedProduct(String(firstProduct.id));
          setProductName(firstProduct.name);
        }
      }
    }
  }, [isEditMode, editSales, setValue]);

  // Auto-generate invoice for new sales
  useEffect(() => {
    if (!isEditMode) {
      const lastInvoice = localStorage.getItem("lastInvoiceNo");
      if (lastInvoice) {
        const num = parseInt(lastInvoice.replace("INV-", ""), 10);
        const newInvoiceNo = `INV-${String(num).padStart(5, "0")}`;
        setInvoiceNo(newInvoiceNo);
        setValue("invoiceNo", newInvoiceNo);
      } else {
        setInvoiceNo(
          generateVoucherNo(
            "INV",
            selectedBranch ? JSON.parse(selectedBranch)?.name : "",
          ),
        );
        setValue(
          "invoiceNo",
          generateVoucherNo(
            "INV",
            selectedBranch ? JSON.parse(selectedBranch)?.name : "",
          ),
        );
      }
    }
  }, [isEditMode, setValue]);

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = productData?.data?.find(
      (p: any) => String(p.id) === productId,
    );
    if (!product) return;

    const exists = rows.some(
      (row) => row.variationProductId === Number(productId),
    );
    if (exists && !isEditMode) {
      toast.error("Product already added");
      return;
    }

    const displayName = `${product.product?.name} (${product.size?.name}) (${product.color?.name})`;

    const newRow: ProductRow = {
      id: Date.now(),
      variationProductId: product.id,
      product: displayName,
      type: product.product?.category?.name || "N/A",
      quantity: 1,
      unit: product.product?.unit?.name || "Unit",
      unitPrice: product.salePrice || 0,
      totalPrice: product.salePrice || 0,
    };

    setRows((prev) => [...prev, newRow]);

    // Update form products
    const newProduct = {
      variationProductId: product.id,
      quantity: 1,
      unitPrice: product.salePrice || 0,
    };
    setValue("products", [...formValues.products, newProduct]);
  };

  const handleRowChange = useCallback(
    (rowId: number, field: string, value: number) => {
      setRows((prev) => {
        const updated = prev.map((row) => {
          if (row.id === rowId) {
            const updatedRow = { ...row, [field]: value };
            updatedRow.totalPrice =
              (updatedRow.quantity || 0) * (updatedRow.unitPrice || 0);
            return updatedRow;
          }
          return row;
        });

        // 🔄 Sync RHF form values
        const updatedProducts = updated.map((r) => ({
          variationProductId: r.variationProductId,
          quantity: r.quantity,
          unitPrice: r.unitPrice,
        }));

        setValue("products", updatedProducts);

        return updated;
      });
    },
    [setValue],
  );

  const handleDeleteRow = useCallback((rowId: number) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  const totalAmount = rows.reduce((sum, r) => sum + r.totalPrice, 0);

  // VAT percentage calculation
  const vatAmount = (totalAmount * vat) / 100;

  // Discount calculation
  const discountAmount =
    discountType === "percentage" ? (totalAmount * discount) / 100 : discount;

  const netAmount = totalAmount + vatAmount - discountAmount;

  const dueAmount = netAmount - paid;

  // Update totalPaymentAmount when paid changes
  useEffect(() => {
    setValue("totalPaymentAmount", paid);
  }, [paid, setValue]);

  const onSubmit = async (data: CreateEditSalesFormValues) => {
    try {
      if (isEditMode && salesId) {
        const discountAmount =
          discountType === "percentage"
            ? (totalAmount * discount) / 100
            : discount;

        data.discount = discountAmount;
        data.vat = vatAmount;

        await updateSales({ id: Number(salesId), ...data }).unwrap();
        toast.success("Sales updated successfully");
      } else {
        const discountAmount =
          discountType === "percentage"
            ? (totalAmount * discount) / 100
            : discount;

        data.discount = discountAmount;
        data.vat = vatAmount;

        await createSales(data).unwrap();
        const currentNum = parseInt(invoiceNo.replace("INV-", ""), 10) + 1;
        localStorage.setItem(
          "lastInvoiceNo",
          `INV-${String(currentNum).padStart(5, "0")}`,
        );
        toast.success("Sales created successfully");
      }
      navigate("/sales");
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} sales`,
      );
    }
  };

  const handleSalesDateChange = (date: Date | undefined) => {
    setSalesDate(date);
    if (date) {
      setValue("date", date.toISOString());
    }
  };

  const handleVatChange = (value: number) => {
    setVat(value);
    setValue("vat", value);
  };

  const handleDiscountChange = (value: number) => {
    setDiscount(value);
    setValue("discount", value);
  };

  const handlePaymentAccountChange = (value: string) => {
    const accountId = Number(value);
    setPaymentAccountId(accountId);
    setValue("paymentAccountId", accountId);
  };

  const columns: ColumnDef<ProductRow>[] = useMemo(
    () => [
      { accessorKey: "product", header: "Product" },
      { accessorKey: "type", header: "Type" },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <Input
            type="number"
            className="text-center"
            value={row.original.quantity || ""}
            onChange={(e) =>
              handleRowChange(
                row.original.id,
                "quantity",
                Number(e.target.value),
              )
            }
          />
        ),
      },
      { accessorKey: "unit", header: "Unit" },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => (
          <Input
            type="number"
            className="text-center"
            value={row.original.unitPrice || ""}
            onChange={(e) =>
              handleRowChange(
                row.original.id,
                "unitPrice",
                Number(e.target.value),
              )
            }
          />
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => row.original.totalPrice.toFixed(2),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <Button
            variant="outline"
            className="bg-gray-100 text-red-400"
            size="icon"
            onClick={() => handleDeleteRow(row.original.id)}
          >
            <FaTrashAlt />
          </Button>
        ),
      },
    ],
    [handleRowChange, handleDeleteRow],
  );

  if (isEditMode && isLoadingSales) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <HomeLoader />
      </div>
    );
  }

  return (
    <section className="p-2 md:p-4 shadow-sm border bg-white rounded-md">
      <Heading className="text-[#5e48d8] font-semibold mb-4">
        {isEditMode ? "Edit Sales" : "Create Sales"}
      </Heading>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Top Inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Label>Sales Date {requiredStar}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between mt-1 text-left font-normal bg-gray-50 hover:bg-gray-100",
                      !salesDate && "text-muted-foreground",
                    )}
                  >
                    {salesDate
                      ? format(salesDate, "MM-dd-yyyy")
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={salesDate}
                    onSelect={handleSalesDateChange}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <Label>Invoice No. {requiredStar}</Label>
              <Input
                {...register("invoiceNo")}
                value={invoiceNo}
                onChange={(e) => {
                  setInvoiceNo(e.target.value);
                  setValue("invoiceNo", e.target.value);
                }}
                className="bg-gray-100"
                readOnly={isEditMode}
              />
              {errors.invoiceNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.invoiceNo.message}
                </p>
              )}
            </div>

            <div className="flex gap-x-4 items-center">
              <div className="w-full">
                <Label>Customer Name {requiredStar}</Label>

                <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                  <PopoverTrigger asChild>
                    <button
                      className="
                        w-full bg-gray-50 hover:bg-gray-100 border 
                        px-3 h-[48px] flex items-center justify-between rounded-md
                      "
                      type="button"
                    >
                      <span>
                        {selectedCustomer
                          ? selectedCustomer.accountType
                          : "Select Customer"}
                      </span>
                      <ChevronDown size={16} />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0">
                    {/* Search Bar */}
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>

                    {/* Customer List */}
                    <div className="max-h-64 overflow-y-auto">
                      {customers?.data
                        ?.filter((item: any) =>
                          item.accountType
                            ?.toLowerCase()
                            .includes(customerSearch.toLowerCase()),
                        )
                        ?.map((item: any) => (
                          <div
                            key={item.id}
                            className={`
                              px-3 py-2 text-sm cursor-pointer hover:bg-accent
                              ${
                                selectedCustomer?.id === item.id
                                  ? "bg-accent"
                                  : ""
                              }
                            `}
                            onClick={() => {
                              setSelectedCustomer(item);
                              setCustomerId(item.id);
                              setValue("customerId", item.id);
                              setOpenCustomer(false);
                              setCustomerSearch("");
                            }}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlight(
                                  item.accountType,
                                  customerSearch,
                                ),
                              }}
                            />
                          </div>
                        ))}

                      {/* No results */}
                      {customers?.data &&
                        customers?.data.filter((item: any) =>
                          item.accountType
                            ?.toLowerCase()
                            .includes(customerSearch.toLowerCase()),
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No results found.
                          </div>
                        )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.customerId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.customerId.message}
                  </p>
                )}
              </div>

              <span
                onClick={() => setIsModalOpen(true)}
                className="bg-[#6E56CF] text-white hover:cursor-pointer mt-10 p-3 rounded-md"
              >
                <FaPlus size={20} />
              </span>
            </div>

            <div className="mb-4">
              <Label>Product {requiredStar}</Label>

              <Popover open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverTrigger asChild>
                  <button
                    className="
                      w-full bg-gray-50 hover:bg-gray-100 border 
                      px-3 h-[48px] flex items-center justify-between rounded-md
                    "
                    type="button"
                  >
                    <span>{productname ? productname : "Select Product"}</span>
                    <ChevronDown size={16} />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="p-0">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {productData?.data
                      ?.filter((product: any) =>
                        product.product?.name
                          ?.toLowerCase()
                          .includes(productSearch.toLowerCase()),
                      )
                      ?.map((product: any) => {
                        const label = `${product.product?.name || "Unnamed"} (${
                          product.size?.name || "N/A"
                        }) (${product.color?.name || "N/A"})`;

                        return (
                          <div
                            key={product.id}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                              selectedProduct === String(product.id)
                                ? "bg-accent"
                                : ""
                            }`}
                            onClick={() => {
                              setProductName(label);
                              setSelectedProduct(String(product.id));
                              handleProductSelect(String(product.id));
                              setOpenProduct(false);
                              setProductSearch("");
                            }}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlight(label, productSearch),
                              }}
                            />
                          </div>
                        );
                      })}

                    {/* No result message */}
                    {productData?.data &&
                      productData?.data.filter((product: any) =>
                        product.name
                          ?.toLowerCase()
                          .includes(productSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No results found.
                        </div>
                      )}
                  </div>
                </PopoverContent>
              </Popover>
              {errors.products && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.products.message}
                </p>
              )}
            </div>
          </div>

          {/* Product Table */}
          <div className="border rounded-md overflow-x-auto">
            <ReusableTable<ProductRow>
              key="sales-products-table"
              columns={columns}
              data={rows}
            />
          </div>

          {/* Totals Section */}
          <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <div>
                <Label>Payment Method {requiredStar}</Label>
                <Select
                  value={
                    paymentAccountId ? String(paymentAccountId) : undefined
                  }
                  onValueChange={handlePaymentAccountChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAccounts?.data?.map((account: any) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.accountType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentAccountId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentAccountId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Total Amount</Label>
                <Input
                  value={totalAmount.toFixed(2)}
                  readOnly
                  className="w-1/3 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>VAT & Tax (%)</Label>
                <Input
                  type="number"
                  value={vat === 0 ? "" : vat}
                  onChange={(e) => handleVatChange(Number(e.target.value))}
                  className="w-1/3 text-right"
                />
              </div>
              {/* <div className="flex justify-between items-center">
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={discount === 0 ? "" : discount}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="w-1/3 text-right"
                />
              </div> */}
              <div className="flex justify-between items-center gap-2">
                <Label>Discount</Label>

                <div className="flex gap-2 w-1/2">
                  <Select
                    value={discountType}
                    onValueChange={(value) =>
                      setDiscountType(value as "fixed" | "percentage")
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={discount === 0 ? "" : discount}
                    onChange={(e) =>
                      handleDiscountChange(Number(e.target.value))
                    }
                    className="text-right"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Label>Net Amount</Label>
                <Input
                  value={netAmount.toFixed(2)}
                  readOnly
                  className="w-1/3 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Paid Amount</Label>
                <Input
                  type="number"
                  value={paid === 0 ? "" : paid}
                  onChange={(e) => setPaid(Number(e.target.value))}
                  className="w-1/3 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Due Amount</Label>
                <Input
                  value={dueAmount.toFixed(2)}
                  readOnly
                  className="w-1/3 text-right"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="hover:bg-[#6E56CF] bg-primary text-white px-6 rounded-none"
            >
              <GrNotes className="mr-2" />
              {isLoading || isSubmitting
                ? "Submitting..."
                : isEditMode
                  ? "Update Sales"
                  : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Create Customer Modal */}
      <div className="flex gap-2">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <Heading className="text-[#5e48d8] font-semibold">
                Create Particular Account
              </Heading>
            </DialogHeader>
            <hr className="border" />
            <CreateParticularAccountModal
              onClose={() => setIsModalOpen(false)}
              editingParticular={editingParticular}
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
