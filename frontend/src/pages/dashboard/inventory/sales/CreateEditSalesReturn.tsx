import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useCreateSalesReturnMutation,
  useGetSalesByInvoiceQuery,
  useGetSalesReturnByIdQuery,
  useUpdateSalesReturnMutation,
} from "@/components/store/api/sales/salesReturnApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/common/ReusableTable";

import { requiredStar } from "@/utils/helper/requiredStar";

import Heading from "@/components/typography/Heading";
import { useGetAllAccountsParticularQuery } from "@/components/store/api/particularAccount/particularAccountApi";
import {
  SalesReturnFormValues,
  salesReturnSchema,
} from "@/schemas/admin/inventory/sales/salesReturnSchema";
import { generateVoucherNo } from "@/utils/helper/randomValueGenerator";

type ProductRow = {
  id: number;
  product: string;
  saleQty: number;
  unit: string;
  variationProductId: number;
  unitPrice: number;
};

export default function CreateEditSalesReturn() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);
  const navigate = useNavigate();

  const selectedBranch = localStorage.getItem("selectedBranch");

  const [searchValue, setSearchValue] = useState("");
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null);
  const [returnInvoiceNo, setReturnInvoiceNo] = useState<string>(
    generateVoucherNo(
      "SR",
      selectedBranch ? JSON.parse(selectedBranch)?.name : "",
    ),
  );
  const [paymentAccountId, setPaymentAccountId] = useState<
    number | undefined
  >();

  const [tableRows, setTableRows] = useState<ProductRow[]>([]);

  const { data: allAccounts } = useGetAllAccountsParticularQuery({});

  // API hooks
  const { data: salesData } = useGetSalesByInvoiceQuery(invoiceNo || "", {
    skip: !invoiceNo || isEditMode,
  });
  const { data: singleSalesReturnData } = useGetSalesReturnByIdQuery(
    Number(editId),
    { skip: !isEditMode },
  );
  const [createSalesReturn, { isLoading: isCreating }] =
    useCreateSalesReturnMutation();
  const [updateSalesReturn] = useUpdateSalesReturnMutation();

  // Form setup
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<SalesReturnFormValues>({
    resolver: zodResolver(salesReturnSchema),
    defaultValues: {
      products: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "products",
  });

  // Search invoice
  const handleSearch = () => {
    if (!searchValue) return;
    setInvoiceNo(searchValue);
  };

  // Prefill data for create mode
  useEffect(() => {
    if (salesData?.data && !isEditMode) {
      const sale = salesData.data;
      const products =
        sale.SaleProduct?.map((p: any) => ({
          variationProductId: p.variationProductId,
          quantity: 1,
          damageQuantity: 0,
          unitPrice: p.unitPrice,
        })) || [];

      // Create table rows
      const rows: ProductRow[] =
        sale.SaleProduct?.map((p: any, index: number) => ({
          id: index + 1,
          product: `${p.productVariation?.product?.name || "Unknown"} - ${
            p.productVariation?.color?.name || ""
          } - ${p.productVariation?.size?.name || ""}`,
          saleQty: p.quantity,
          unit: p.productVariation?.product?.unit?.name || "",
          variationProductId: p.variationProductId,
          unitPrice: p.unitPrice,
        })) || [];

      setTableRows(rows);

      reset({
        saleId: sale.id,
        date: new Date().toISOString().split("T")[0], // Use current date for return
        invoiceNo: returnInvoiceNo,
        paymentAccountId: sale.paymentAccountId,
        products,
      });
      replace(products);
      setPaymentAccountId(sale.paymentAccountId);
    }
  }, [salesData?.data, reset, replace, isEditMode, returnInvoiceNo]);

  // Prefill data for edit mode
  useEffect(() => {
    if (singleSalesReturnData?.data && isEditMode) {
      const d = singleSalesReturnData.data;
      const products =
        d?.salesReturnProducts?.map((p: any) => ({
          variationProductId: p.variationProductId,
          quantity: p.quantity,
          damageQuantity: p.damageQuantity,
          unitPrice: p.unitPrice,
        })) || [];

      // Create table rows for edit mode
      const rows: ProductRow[] =
        d?.salesReturnProducts?.map((p: any, index: number) => ({
          id: index + 1,
          product: `${p.productVariation?.product?.name || "Unknown"} - ${
            p.productVariation?.color?.name || ""
          } - ${p.productVariation?.size?.name || ""}`,
          saleQty: p.quantity + (p.damageQuantity || 0),
          unit: p.productVariation?.product?.unit?.name || "",
          variationProductId: p.variationProductId,
          unitPrice: p.unitPrice,
        })) || [];

      setTableRows(rows);
      setPaymentAccountId(d.paymentAccountId);

      reset({
        saleId: d.saleId,
        date: d.date.split("T")[0],
        invoiceNo: d.invoiceNo,
        paymentAccountId: Number(d.paymentAccountId),
        products,
      });
      replace(products);
      setReturnInvoiceNo(d.invoiceNo);
    }
  }, [singleSalesReturnData?.data, isEditMode, reset, replace]);

  //  Auto-increment invoice logic
  useEffect(() => {
    if (!isEditMode) {
      const lastInvoice = localStorage.getItem("lastSalesReturnInvoiceNo");
      if (lastInvoice) {
        const num = parseInt(lastInvoice.replace("SR-", ""), 10);
        const newInvoiceNo = `SR-${String(num + 1).padStart(5, "0")}`;
        setReturnInvoiceNo(newInvoiceNo);
        setValue("invoiceNo", newInvoiceNo);
      } else {
        setReturnInvoiceNo(
          generateVoucherNo(
            "SR",
            selectedBranch ? JSON.parse(selectedBranch)?.name : "",
          ),
        );
        setValue(
          "invoiceNo",
          generateVoucherNo(
            "SR",
            selectedBranch ? JSON.parse(selectedBranch)?.name : "",
          ),
        );
      }
    } else if (singleSalesReturnData?.data?.invoiceNo) {
      setReturnInvoiceNo(singleSalesReturnData.data.invoiceNo);
    }
  }, [isEditMode, singleSalesReturnData, setValue]);

  // Submit handler
  const onSubmit = async (formData: SalesReturnFormValues) => {
    try {
      let res;
      if (isEditMode) {
        res = await updateSalesReturn({
          id: editId,
          data: formData,
        }).unwrap();
      } else {
        res = await createSalesReturn(formData).unwrap();
      }

      toast.success(
        res?.message ||
          (isEditMode
            ? "Sales return updated successfully!"
            : "Sales return created successfully!"),
        { id: "sales-return" },
      );

      navigate("/sales-return");

      // Update invoice counter for next return
      if (!isEditMode) {
        const currentNum = parseInt(returnInvoiceNo.replace("SR-", ""), 10) + 1;
        const nextInvoice = `SR-${String(currentNum).padStart(5, "0")}`;
        localStorage.setItem("lastSalesReturnInvoiceNo", nextInvoice);
        setReturnInvoiceNo(nextInvoice);
      }

      reset();
      if (!isEditMode) {
        setInvoiceNo(null);
        setTableRows([]);
      }
    } catch (err: any) {
      console.error("Error submitting sales return:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          (isEditMode
            ? "Failed to update sales return!"
            : "Failed to create sales return!"),
        { id: "sales-return" },
      );
    }
  };

  const columns: ColumnDef<ProductRow>[] = useMemo(() => {
    return [
      { accessorKey: "product", header: "Product" },
      { accessorKey: "saleQty", header: "Sale Qty" },
      {
        accessorKey: "quantity",
        header: "Return Quantity",
        cell: ({ row }) => {
          const rowIndex = tableRows.findIndex((r) => r.id === row.original.id);
          return (
            <Controller
              control={control}
              name={`products.${rowIndex}.quantity`}
              render={({ field }) => (
                <Input
                  type="number"
                  className="text-center"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={0}
                  max={row.original.saleQty}
                />
              )}
            />
          );
        },
      },
      { accessorKey: "unit", header: "Unit" },
      {
        accessorKey: "damageQuantity",
        header: "Damage Quantity",
        cell: ({ row }) => {
          const rowIndex = tableRows.findIndex((r) => r.id === row.original.id);
          return (
            <Controller
              control={control}
              name={`products.${rowIndex}.damageQuantity`}
              render={({ field }) => (
                <Input
                  type="number"
                  className="text-center"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={0}
                />
              )}
            />
          );
        },
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => {
          const rowIndex = tableRows.findIndex((r) => r.id === row.original.id);
          return (
            <Controller
              control={control}
              name={`products.${rowIndex}.unitPrice`}
              render={({ field }) => (
                <Input
                  type="number"
                  className="text-center"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          );
        },
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => {
          const rowIndex = tableRows.findIndex((r) => r.id === row.original.id);
          const unitPrice = watch(`products.${rowIndex}.unitPrice`) || 0;
          const quantity = watch(`products.${rowIndex}.quantity`) || 0;
          return <span>{(unitPrice * quantity).toFixed(2)}</span>;
        },
      },
    ];
  }, [control, watch, tableRows]);

  const grandTotal = useMemo(() => {
    return fields
      .reduce(
        (acc, f) =>
          acc + (Number(f.unitPrice) || 0) * (Number(f.quantity) || 0),
        0,
      )
      .toFixed(2);
  }, [fields]);

  const handlePaymentAccountChange = (value: string) => {
    const accountId = Number(value);
    setPaymentAccountId(accountId);
    setValue("paymentAccountId", accountId);
  };

  if (isEditMode && !singleSalesReturnData?.data?.paymentAccountId) return null;

  return (
    <div className="space-y-6 p-4">
      {/* Search */}
      <div className="flex items-center justify-between p-4 bg-white">
        <Heading>
          {isEditMode ? "Edit Sales Return" : "Create Sales Return"}
        </Heading>
        {!isEditMode && (
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Enter Invoice No"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={!searchValue}>
              Search
            </Button>
          </div>
        )}
      </div>

      {(salesData?.data || singleSalesReturnData?.data) && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-white p-4 rounded shadow"
        >
          {/* Top row: date, customer, invoice */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>

            <div className="space-y-1">
              <Label>Customer</Label>
              <Input
                readOnly
                value={
                  isEditMode
                    ? singleSalesReturnData?.data?.customer?.accountType || ""
                    : salesData?.data?.customer?.accountType || ""
                }
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <Label>Return Invoice No. {requiredStar}</Label>
              <Input
                {...register("invoiceNo")}
                value={returnInvoiceNo}
                onChange={(e) => {
                  setReturnInvoiceNo(e.target.value);
                  setValue("invoiceNo", e.target.value);
                }}
              />
              {errors.invoiceNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.invoiceNo.message}
                </p>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <Label>Products</Label>
            {tableRows?.length > 0 ? (
              <>
                <ReusableTable columns={columns} data={tableRows} />
                <div className="text-right font-semibold pt-3">
                  Grand Total: {grandTotal}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No products found
              </div>
            )}
          </div>

          {/* Payment Account */}
          {isEditMode ? (
            paymentAccountId && (
              <div className="space-y-1 w-full max-w-[300px]">
                <Label>Payment Account</Label>
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
                  <p className="text-red-500 text-sm">
                    {errors.paymentAccountId.message}
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="space-y-1 w-full max-w-[300px]">
              <Label>Payment Account</Label>
              <Select
                value={paymentAccountId ? String(paymentAccountId) : undefined}
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
                <p className="text-red-500 text-sm">
                  {errors.paymentAccountId.message}
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isCreating}>
              {isEditMode
                ? isCreating
                  ? "Updating..."
                  : "Update Return"
                : isCreating
                  ? "Submitting..."
                  : "Create Return"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
