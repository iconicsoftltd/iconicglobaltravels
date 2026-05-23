import {
  useGetAllAccountsParticularQuery,
  useGetAllSupplierParticularQuery,
} from "@/components/store/api/particularAccount/particularAccountApi";
import {
  useCreatePurchaseMutation,
  useGetPurchaseByIdQuery,
  useUpdatePurchaseMutation,
} from "@/components/store/api/purchase/purchaseApi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ReusableTable } from "@/components/common/ReusableTable";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { requiredStar } from "@/utils/helper/requiredStar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { GrNotes } from "react-icons/gr";

import CreateParticularAccountModal from "@/components/common/modals/CreateParticularAccountModal";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetAllProductVariationsQuery } from "@/components/store/api/inventory/productVariationApi";
import Heading from "@/components/typography/Heading";
import {
  PurchaseFormValues,
  purchaseSchema,
} from "@/schemas/admin/inventory/purchase/purchaseSchema";
import { generateVoucherNo } from "@/utils/helper/randomValueGenerator";
import { highlight } from "@/utils/helper/textHighlighter";

type ProductRow = {
  id: number;
  variationProductId: number;
  product: string;
  type: string;
  quantity: number;
  damageQty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

export default function CreateEditPurchaseForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const purchaseId = searchParams.get("id");
  const isEditMode = Boolean(purchaseId);

  const { data: editPurchase, isLoading: isLoadingPurchase } =
    useGetPurchaseByIdQuery(purchaseId ? Number(purchaseId) : 0, {
      skip: !purchaseId,
    });

  const selectedBranch = localStorage.getItem("selectedBranch");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      date: new Date().toISOString(),
      challanNo: generateVoucherNo(
        "CHL",
        selectedBranch ? JSON.parse(selectedBranch)?.name : "",
      ),
      supplierId: undefined,
      paymentAccountId: undefined,
      totalPaymentAmount: 0,
      vat: 0,
      tc: 0,
      products: [],
    },
  });

  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    new Date(),
  );
  const [vat, setVat] = useState(0);
  const [paid, setPaid] = useState(0);
  const [paymentAccountId, setPaymentAccountId] = useState<
    number | undefined
  >();
  const [, setSupplierId] = useState<number | undefined>();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [editingParticular] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [partySearch, setPartySearch] = useState("");
  const [openParty, setOpenParty] = useState(false);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [openProduct, setOpenProduct] = useState(false);

  const [productname, setProductName] = useState("");

  // const { data: accounts } = useGetAllParticularQuery({});
  const { data: accounts } = useGetAllSupplierParticularQuery({});
  const { data: allAccounts } = useGetAllAccountsParticularQuery({});
  const { data: productData } = useGetAllProductVariationsQuery({});

  const [createPurchase, { isLoading: isCreating }] =
    useCreatePurchaseMutation();
  const [updatePurchase, { isLoading: isUpdating }] =
    useUpdatePurchaseMutation();

  const isLoading = isCreating || isUpdating;

  // Challan No logic
  const [challanNo, setChallanNo] = useState<string>(
    generateVoucherNo(
      "CHL",
      selectedBranch ? JSON.parse(selectedBranch)?.name : "",
    ),
  );

  // Watch form values
  const formValues = watch();

  // Pre-fill form when in edit mode and data is available
  useEffect(() => {
    if (isEditMode && editPurchase?.data) {
      const purchase = editPurchase.data;

      // Set basic information
      setPurchaseDate(new Date(purchase.date));
      setChallanNo(purchase.challanNo);
      setVat(purchase.vat || 0);
      setPaid(purchase.totalPaymentAmount || 0);
      setSupplierId(purchase.supplierId);
      setPaymentAccountId(purchase.paymentAccountId);
      setProductName(
        (purchase.PurchaseProduct &&
          Array.isArray(purchase.PurchaseProduct) &&
          purchase.PurchaseProduct[0]?.productVariation?.product?.name) ||
          "",
      );

      // Set form values
      setValue("date", purchase.date);
      setValue("challanNo", purchase.challanNo);
      setValue("supplierId", purchase.supplierId);
      setValue("paymentAccountId", purchase.paymentAccountId);
      setValue("totalPaymentAmount", purchase.totalPaymentAmount || 0);
      setValue("vat", purchase.vat || 0);
      setValue("tc", purchase.tc || 0);

      // Set selected party
      if (purchase.supplier) {
        setSelectedParty(purchase.supplier);
      }

      // Set product rows
      if (purchase.PurchaseProduct && purchase.PurchaseProduct.length > 0) {
        const productRows: ProductRow[] = purchase.PurchaseProduct.map(
          (item: any) => ({
            id: item.id,
            variationProductId: item.variationProductId,
            product: item.productVariation?.product?.name || "Unknown Product",
            type: item.productVariation?.product?.category?.name || "N/A",
            quantity: item.quantity,
            damageQty: item.damageQuantity,
            unit: item.productVariation?.product?.unit?.name || "Unit",
            unitPrice: item.unitPrice,
            totalPrice: item.subTotal,
          }),
        );
        setRows(productRows);

        // Set form products
        setValue(
          "products",
          purchase.PurchaseProduct.map((item: any) => ({
            variationProductId: item.variationProductId,
            quantity: item.quantity,
            damageQuantity: item.damageQuantity,
            unitPrice: item.unitPrice,
          })),
        );
      }
    }
  }, [isEditMode, editPurchase, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      const lastChallan = localStorage.getItem("lastChallanNo");
      if (lastChallan) {
        const num = parseInt(lastChallan.replace("CHL-", ""), 10);
        const newChallanNo = `CHL-${String(num).padStart(5, "0")}`;
        setChallanNo(newChallanNo);
        setValue("challanNo", newChallanNo);
      } else {
        setChallanNo(
          generateVoucherNo(
            "CHL",
            selectedBranch ? JSON.parse(selectedBranch)?.name : "",
          ),
        );
        setValue(
          "challanNo",
          generateVoucherNo(
            "CHL",
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
      variationProductId: Number(product.id),
      product: displayName,
      type: product.product?.category?.name || "N/A",
      quantity: 1,
      damageQty: 0,
      unit: product.product?.unit?.name || "Unit",
      unitPrice: product.salePrice || 0,
      totalPrice: product.salePrice || 0,
    };

    setRows((prev) => [...prev, newRow]);

    // Update form products
    const newProduct = {
      variationProductId: Number(product.id),
      quantity: 1,
      damageQuantity: 0,
      unitPrice: product.salePrice || 0,
    };
    setValue("products", [...formValues.products, newProduct]);
  };

  // const handleRowChange = useCallback(
  //   (rowId: number, field: string, value: number) => {
  //     setRows((prev) =>
  //       prev.map((row) => {
  //         if (row.id === rowId) {
  //           const updatedRow = { ...row, [field]: value };
  //           updatedRow.totalPrice =
  //             (updatedRow.quantity || 0) * (updatedRow.unitPrice || 0);
  //           return updatedRow;
  //         }
  //         return row;
  //       })
  //     );
  //   },
  //   []
  // );

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
          damageQuantity: r.damageQty,
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
  const netAmount = totalAmount + (totalAmount * vat) / 100;
  const dueAmount = netAmount - paid;

  // Update totalPaymentAmount when paid changes
  useEffect(() => {
    setValue("totalPaymentAmount", paid);
  }, [paid, setValue]);

  // Handle form submission for both create and edit
  const onSubmit = async (data: PurchaseFormValues) => {
    try {
      if (isEditMode && purchaseId) {
        // Update existing purchase
        await updatePurchase({ id: Number(purchaseId), ...data }).unwrap();
        toast.success("Purchase updated successfully");
        navigate("/purchase"); // Redirect after update
      } else {
        // Create new purchase
        await createPurchase(data).unwrap();
        const currentNum = parseInt(challanNo.replace("CHL-", ""), 10) + 1;
        localStorage.setItem(
          "lastChallanNo",
          `CHL-${String(currentNum).padStart(5, "0")}`,
        );
        setChallanNo(`CHL-${String(currentNum).padStart(5, "0")}`);
        toast.success("Purchase created successfully");
        navigate("/purchase"); // Redirect after create
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} purchase`,
      );
    }
  };

  const handlePurchaseDateChange = (date: Date | undefined) => {
    setPurchaseDate(date);
    if (date) {
      setValue("date", date.toISOString());
    }
  };

  const handleVatChange = (value: number) => {
    setVat(value);
    setValue("vat", value);
  };

  const handlePaymentAccountChange = (value: string) => {
    const accountId = Number(value);
    setPaymentAccountId(accountId);
    setValue("paymentAccountId", accountId);
  };

  // Reusable Table columns
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
            value={row.original.quantity || ""}
            className="text-center"
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

  // Show loading state while fetching purchase data in edit mode
  if (isEditMode && isLoadingPurchase) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HomeLoader />
        </div>
      </div>
    );
  }

  return (
    <section className="p-2 md:p-4 shadow-sm border rounded-md bg-white">
      <Heading className=" font-semibold mb-4">
        {isEditMode ? "Edit Purchase" : "Create Purchase"}
      </Heading>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Top Inputs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Label>Purchase Date {requiredStar}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between mt-1 text-left font-normal bg-gray-50 hover:bg-gray-100",
                      !purchaseDate && "text-muted-foreground",
                    )}
                  >
                    {purchaseDate
                      ? format(purchaseDate, "MM-dd-yyyy")
                      : "Pick a date"}
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={handlePurchaseDateChange}
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
              <Label>Challan No. {requiredStar}</Label>
              <Input
                {...register("challanNo")}
                value={challanNo}
                onChange={(e) => {
                  setChallanNo(e.target.value);
                  setValue("challanNo", e.target.value);
                }}
                className="bg-gray-100"
                readOnly={isEditMode}
              />
              {errors.challanNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.challanNo.message}
                </p>
              )}
            </div>

            <div className="flex gap-x-4 items-center ">
              <div className="w-full">
                <Label>Party Name {requiredStar}</Label>

                <Popover open={openParty} onOpenChange={setOpenParty}>
                  <PopoverTrigger asChild>
                    <button
                      className="
            w-full bg-gray-50 hover:bg-gray-100 border 
            px-3 h-[48px] flex items-center justify-between rounded-md
          "
                      type="button"
                    >
                      <span>
                        {selectedParty
                          ? selectedParty.accountType
                          : "Select Supplier"}
                      </span>
                      <ChevronDown size={16} />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0">
                    {/* ✅ SEARCH BAR */}
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search..."
                        value={partySearch}
                        onChange={(e) => setPartySearch(e.target.value)}
                        className="h-8"
                      />
                    </div>

                    {/* ✅ LIST */}
                    <div className="max-h-64 overflow-y-auto">
                      {accounts?.data
                        ?.filter((item: any) =>
                          item.accountType
                            ?.toLowerCase()
                            .includes(partySearch.toLowerCase()),
                        )
                        ?.map((item: any) => (
                          <div
                            key={item.id}
                            className={`
            px-3 py-2 text-sm cursor-pointer hover:bg-accent
            ${selectedParty?.id === item.id ? "bg-accent" : ""}
          `}
                            onClick={() => {
                              setSelectedParty(item);
                              setSupplierId(item.id);
                              setValue("supplierId", item.id);
                              setOpenParty(false);
                              setPartySearch("");
                            }}
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlight(
                                  item.accountType,
                                  partySearch,
                                ),
                              }}
                            />
                          </div>
                        ))}

                      {/* ✅ No results */}
                      {accounts?.data &&
                        accounts?.data.filter((item: any) =>
                          item.accountType
                            ?.toLowerCase()
                            .includes(partySearch.toLowerCase()),
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No results found.
                          </div>
                        )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.supplierId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supplierId.message}
                  </p>
                )}
              </div>

              <span
                onClick={() => setIsModalOpen(true)}
                className="bg-[#6E56CF] text-white hover:cursor-pointer mt-10 p-3 rounded-md "
              >
                <FaPlus size={20}></FaPlus>
              </span>
            </div>

            <div className="mb-4">
              <div>
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
                      <span>
                        {productname ? productname : "Select Product"}
                      </span>
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
                          const label = `${
                            product.product?.name || "Unnamed"
                          } (${product.size?.name || "N/A"}) (${
                            product.color?.name || "N/A"
                          })`;

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
                                // setSelectedProduct(String(product.id));
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

                      {/* ✅ No result message */}
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
          </div>

          {/* Product Table */}
          <div className="border rounded-md overflow-x-auto">
            <ReusableTable<ProductRow>
              key="purchase-products-table"
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
                  placeholder="0"
                  className="w-1/3 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Net Amount </Label>
                <Input
                  value={netAmount.toFixed(2)}
                  readOnly
                  className="w-1/3 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Paid Amount </Label>
                <Input
                  type="number"
                  value={paid === 0 ? "" : paid}
                  onChange={(e) => setPaid(Number(e.target.value))}
                  className="w-1/3 text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Due Amount </Label>
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
              className="hover:bg-[#6E56CF] bg-primary text-white px-6 rounded-none "
            >
              <GrNotes className="mr-2" />
              {isLoading || isSubmitting
                ? "Submitting..."
                : isEditMode
                  ? "Update Purchase"
                  : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>

      <div className="flex gap-2">
        {/* Create Button with Modal */}
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
