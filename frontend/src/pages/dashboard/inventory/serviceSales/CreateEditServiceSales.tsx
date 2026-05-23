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
import HomeLoader from "@/components/loader/HomeLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateEditServiceSalesFormValues,
  createEditServiceSalesSchema,
} from "@/schemas/admin/inventory/serviceSales/createEditServiceSalesSchema";
import {
  useCreateServiceSalesMutation,
  useGetServiceSalesByIdQuery,
  useUpdateServiceSalesMutation,
} from "@/components/store/api/inventory/serviceSales/serviceSalesApi";
import { useGetAllServiceQuery } from "@/components/store/api/service/serviceApi";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import { generateVoucherNo } from "@/utils/helper/randomValueGenerator";

type ProductRow = {
  id: number;
  serviceId: number;
  product: string;
  type: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
};

export default function CreateEditServiceSales() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const salesId = searchParams.get("id");
  const isEditMode = Boolean(salesId);

  const { data: editSales, isLoading: isLoadingSales } =
    useGetServiceSalesByIdQuery(salesId ? Number(salesId) : 0, {
      skip: !salesId,
    });

  const selectedBranch = localStorage.getItem("selectedBranch");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEditServiceSalesFormValues>({
    resolver: zodResolver(createEditServiceSalesSchema),
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
  const { data: productData } = useGetAllServiceQuery({});
  const currentCurrency = useSelector(selectCurrentCurrency);

  const [createSales, { isLoading: isCreating }] =
    useCreateServiceSalesMutation();
  const [updateSales, { isLoading: isUpdating }] =
    useUpdateServiceSalesMutation();
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

      // ✅ Corrected Service Product mapping
      if (sale.serviceSaleProducts && sale.serviceSaleProducts.length > 0) {
        const productRows: ProductRow[] = sale.serviceSaleProducts.map(
          (item: any) => ({
            id: item.id,
            serviceId: item.serviceId,
            product: item.service?.name || "Unknown Service",
            type: "Service", // Services don't have categories like products
            quantity: item.quantity,
            unit: "Service", // Services typically don't have units
            price: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          }),
        );
        setRows(productRows);

        // Set form products
        setValue(
          "products",
          sale.serviceSaleProducts.map((item: any) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        );

        // Set first product name for dropdown label
        const firstService = sale.serviceSaleProducts[0]?.service;
        if (firstService) {
          setSelectedProduct(String(firstService.id));
          setProductName(firstService.name);
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

  const handleProductSelect = (serviceId: string) => {
    setSelectedProduct(serviceId);
    const service = productData?.data?.find(
      (s: any) => String(s.id) === serviceId,
    );
    if (!service) return;

    const exists = rows.some((row) => row.serviceId === Number(serviceId));
    if (exists && !isEditMode) {
      toast.error("Service already added");
      return;
    }

    const newRow: ProductRow = {
      id: Date.now(),
      serviceId: service.id,
      product: service.name,
      type: "Service",
      quantity: 1,
      unit: "Service",
      price: service.price || 0,
      totalPrice: service.price || 0,
    };

    setRows((prev) => [...prev, newRow]);

    // Update form products
    const newProduct = {
      serviceId: service.id,
      quantity: 1,
      unitPrice: service.price || 0,
    };
    setValue("products", [...formValues.products, newProduct]);
  };

  const handleRowChange = useCallback(
    (rowId: number, field: string, value: number) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id === rowId) {
            const updatedRow = { ...row, [field]: value };
            updatedRow.totalPrice =
              (updatedRow.quantity || 0) * (updatedRow.price || 0);
            return updatedRow;
          }
          return row;
        }),
      );

      // Update form products when quantity or price changes
      if (field === "quantity" || field === "price") {
        setRows((prev) => {
          const updatedRows = prev.map((row) => {
            if (row.id === rowId) {
              return { ...row, [field]: value };
            }
            return row;
          });

          // Update form products
          setValue(
            "products",
            updatedRows.map((row) => ({
              serviceId: row.serviceId,
              quantity: row.quantity,
              unitPrice: row.price,
            })),
          );

          return updatedRows;
        });
      }
    },
    [setValue],
  );

  const handleDeleteRow = useCallback(
    (rowId: number) => {
      setRows((prev) => {
        const updatedRows = prev.filter((row) => row.id !== rowId);

        // Update form products after deletion
        setValue(
          "products",
          updatedRows.map((row) => ({
            serviceId: row.serviceId,
            quantity: row.quantity,
            unitPrice: row.price,
          })),
        );

        return updatedRows;
      });
    },
    [setValue],
  );

  const totalAmount = rows.reduce((sum, r) => sum + r.totalPrice, 0);
  const netAmount = totalAmount + vat - discount;
  const dueAmount = netAmount - paid;

  // Update totalPaymentAmount when netAmount changes
  useEffect(() => {
    setValue("totalPaymentAmount", netAmount);
  }, [netAmount, setValue]);

  const onSubmit = async (data: CreateEditServiceSalesFormValues) => {
    try {
      if (isEditMode && salesId) {
        await updateSales({ id: Number(salesId), ...data }).unwrap();
        toast.success("Service sales updated successfully");
      } else {
        await createSales(data).unwrap();
        const currentNum = parseInt(invoiceNo.replace("INV-", ""), 10) + 1;
        localStorage.setItem(
          "lastInvoiceNo",
          `INV-${String(currentNum).padStart(5, "0")}`,
        );
        toast.success("Service sales created successfully");
      }
      navigate("/service-sales-list");
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
      { accessorKey: "product", header: "Service" },
      { accessorKey: "type", header: "Type" },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <Input
            type="number"
            min="1"
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
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={row.original.price || ""}
            onChange={(e) =>
              handleRowChange(row.original.id, "price", Number(e.target.value))
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
        {isEditMode ? "Edit Service Sales" : "Create Service Sales"}
      </Heading>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Top Inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Label>Service Sales Date {requiredStar}</Label>
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

            <div className="mt-1.5">
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
              <Label>Service {requiredStar}</Label>

              <Popover open={openProduct} onOpenChange={setOpenProduct}>
                <PopoverTrigger asChild>
                  <button
                    className="
                      w-full bg-gray-50 hover:bg-gray-100 border 
                      px-3 h-[48px] flex items-center justify-between rounded-md
                    "
                    type="button"
                  >
                    <span>{productname ? productname : "Select Service"}</span>
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
                      ?.filter((service: any) =>
                        service?.name
                          ?.toLowerCase()
                          .includes(productSearch.toLowerCase()),
                      )
                      ?.map((service: any) => {
                        const label = `${service?.name || "Unnamed"} - ${
                          currentCurrency.name
                        } ${service?.price || 0}`;

                        return (
                          <div
                            key={service.id}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                              selectedProduct === String(service.id)
                                ? "bg-accent"
                                : ""
                            }`}
                            onClick={() => {
                              setProductName(service.name);
                              setSelectedProduct(String(service.id));
                              handleProductSelect(String(service.id));
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
                      productData?.data.filter((service: any) =>
                        service.name
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

          {/* Service Table */}
          <div className="border rounded-md overflow-x-auto">
            <ReusableTable<ProductRow>
              key="service-sales-table"
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
                <Label>VAT & Tax</Label>
                <Input
                  type="number"
                  value={vat === 0 ? "" : vat}
                  onChange={(e) => handleVatChange(Number(e.target.value))}
                  className="w-1/3 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={discount === 0 ? "" : discount}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="w-1/3 text-right"
                />
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
