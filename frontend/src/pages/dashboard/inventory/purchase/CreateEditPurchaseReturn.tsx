import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  PurchaseReturnFormValues,
  purchaseReturnSchema,
} from "@/schemas/admin/inventory/purchase/purchaseReturnSchema";
import {
  useCreatePurchaseReturnMutation,
  useGetPurchaseByInvoiceQuery,
  useGetPurchaseReturnByIdQuery,
  useUpdatePurchaseReturnMutation,
} from "@/components/store/api/purchase/purchaseReturnApi";
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
import { generateVoucherNo } from "@/utils/helper/randomValueGenerator";

export default function PurchaseReturnForm() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);
  const navigate = useNavigate();

  const selectedBranch = localStorage.getItem("selectedBranch");

  const [searchValue, setSearchValue] = useState("");
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null);
  const [challanNo, setChallanNo] = useState<string>(
    generateVoucherNo(
      "CHL",
      selectedBranch ? JSON.parse(selectedBranch)?.name : "",
    ),
  );
  const [paymentAccountId, setPaymentAccountId] = useState<
    number | undefined
  >();

  const { data: allAccounts } = useGetAllAccountsParticularQuery({});

  // API hooks
  const { data: purchaseData } = useGetPurchaseByInvoiceQuery(invoiceNo || "", {
    skip: !invoiceNo || isEditMode,
  });
  const { data: singlePurchaseData } = useGetPurchaseReturnByIdQuery(
    Number(editId),
    { skip: !isEditMode },
  );
  const [createPurchaseReturn, { isLoading: isCreating }] =
    useCreatePurchaseReturnMutation();
  const [updatePurchaseReturn] = useUpdatePurchaseReturnMutation();

  // Form setup
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<PurchaseReturnFormValues>({
    resolver: zodResolver(purchaseReturnSchema),
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
    if (purchaseData?.data && !isEditMode) {
      const products = purchaseData.data.PurchaseProduct.map((p) => ({
        variationProductId: p.variationProductId,
        quantity: p.quantity,
        damageQuantity: p.damageQuantity || 0,
        unitPrice: p.unitPrice,
      }));

      reset({
        purchaseId: purchaseData.data.id,
        date: purchaseData.data.date.split("T")[0],
        challanNo: challanNo,
        paymentAccountId: purchaseData?.data?.account?.id,
        products,
      });
      replace(products);
    }
  }, [purchaseData?.data, reset, replace, isEditMode, challanNo]);

  // Prefill data for edit mode
  useEffect(() => {
    if (singlePurchaseData?.data && isEditMode) {
      const d = singlePurchaseData.data;
      const products = d.PurchaseReturnProduct.map((p) => ({
        variationProductId: p.variationProductId,
        quantity: p.quantity,
        damageQuantity: p.damageQuantity,
        unitPrice: p.unitPrice,
      }));
      setPaymentAccountId(d.paymentAccountId);

      reset({
        purchaseId: d.purchaseId,
        date: d.date.split("T")[0],
        challanNo: d.challanNo,
        paymentAccountId: Number(d.paymentAccountId),
        products,
      });
      replace(products);
      setChallanNo(d.challanNo);
    }
  }, [singlePurchaseData?.data, isEditMode, reset, replace]);

  // Auto-increment challan logic (same as CreateEditPurchaseForm)
  useEffect(() => {
    if (!isEditMode) {
      const lastChallan = localStorage.getItem("lastReturnChallanNo");
      if (lastChallan) {
        const num = parseInt(lastChallan.replace("CHL-", ""), 10);
        const newChallanNo = `CHL-${String(num + 1).padStart(5, "0")}`;
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
    } else if (singlePurchaseData?.data?.challanNo) {
      setChallanNo(singlePurchaseData.data.challanNo);
    }
  }, [isEditMode, singlePurchaseData, setValue]);

  // Submit handler
  const onSubmit = async (formData: PurchaseReturnFormValues) => {
    try {
      let res;
      if (isEditMode) {
        res = await updatePurchaseReturn({
          id: editId,
          data: formData,
        }).unwrap();
      } else {
        res = await createPurchaseReturn(formData).unwrap();
      }

      toast.success(
        res?.message ||
          (isEditMode
            ? "Purchase return updated successfully!"
            : "Purchase return created successfully!"),
        { id: "purchase-return" },
      );

      navigate("/purchase-return");

      // Update challan counter for next return
      if (!isEditMode) {
        const currentNum = parseInt(challanNo.replace("CHL-", ""), 10) + 1;
        const nextChallan = `CHL-${String(currentNum).padStart(5, "0")}`;
        localStorage.setItem("lastReturnChallanNo", nextChallan);
        setChallanNo(nextChallan);
      }

      reset();
      if (!isEditMode) setInvoiceNo(null);
    } catch (err: any) {
      console.error("Error submitting return:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          (isEditMode
            ? "Failed to update purchase return!"
            : "Failed to create purchase return!"),
        { id: "purchase-return" },
      );
    }
  };

  // Table rows
  const rows = useMemo(() => {
    const productList = isEditMode
      ? singlePurchaseData?.data?.PurchaseReturnProduct
      : purchaseData?.data?.PurchaseProduct;
    if (!productList) return [];

    return productList.map((p, i) => ({
      id: i + 1,
      product: `${p.productVariation.product.name} - ${
        p.productVariation.color?.name || ""
      } - ${p.productVariation.size?.name || ""}`,
      purchaseQty: isEditMode
        ? p.quantity + (p.damageQuantity || 0)
        : p.quantity,
      unit: p.productVariation.product.unit?.name || "",
    }));
  }, [purchaseData?.data, singlePurchaseData?.data, isEditMode]);

  const columns: ColumnDef<(typeof rows)[0]>[] = useMemo(() => {
    return [
      { accessorKey: "product", header: "Product" },
      { accessorKey: "purchaseQty", header: "Purchase Qty" },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row: { index } }) => (
          <Controller
            control={control}
            name={`products.${index}.quantity`}
            render={({ field }) => (
              <Input
                type="number"
                className="text-center"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        ),
      },
      { accessorKey: "unit", header: "Unit" },
      {
        accessorKey: "damageQuantity",
        header: "Damage Quantity",
        cell: ({ row: { index } }) => (
          <Controller
            control={control}
            name={`products.${index}.damageQuantity`}
            render={({ field }) => (
              <Input
                type="number"
                className="text-center"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        ),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row: { index } }) => (
          <Controller
            control={control}
            name={`products.${index}.unitPrice`}
            render={({ field }) => (
              <Input
                type="number"
                className="text-center"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row: { index } }) => {
          const unit = watch(`products.${index}.unitPrice`) || 0;
          const qty = watch(`products.${index}.quantity`) || 0;
          return <span>{(unit * qty).toFixed(2)}</span>;
        },
      },
    ];
  }, [control, watch]);

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

  // const paymentAccountId = watch("paymentAccountId");

  if (isEditMode && !singlePurchaseData?.data?.paymentAccountId) return null;

  return (
    <div className="space-y-6 p-4">
      {/* Search */}
      <div className="flex items-center justify-between p-4 bg-white">
        <Heading>
          {isEditMode ? "Edit Purchase Return" : "Create Purchase Return"}
        </Heading>
        {!isEditMode && (
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Enter Chalan No"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={!searchValue}>
              Search
            </Button>
          </div>
        )}
      </div>

      {(purchaseData?.data || singlePurchaseData?.data) && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-white p-4 rounded shadow"
        >
          {/* Top row: date, supplier, challan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>

            <div className="space-y-1">
              <Label>Supplier</Label>
              <Input
                readOnly
                value={
                  isEditMode
                    ? singlePurchaseData?.data?.supplier?.accountType || ""
                    : purchaseData?.data?.supplier?.accountType || ""
                }
                className="bg-gray-100 cursor-not-allowed"
              />
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
                // className="bg-gray-100"
                // readOnly={isEditMode}
              />
              {errors.challanNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.challanNo.message}
                </p>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <Label>Products</Label>
            <ReusableTable columns={columns} data={rows} />
            <div className="text-right font-semibold pt-3">
              Grand Total: {grandTotal}
            </div>
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
