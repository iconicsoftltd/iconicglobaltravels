"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { format } from "date-fns";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { CalendarIcon } from "lucide-react";
import { GrNotes } from "react-icons/gr";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar } from "@/components/ui/calendar";

import {
  useGetAllAccountsParticularQuery,
  useGetAllExpenseParticularQuery,
} from "@/components/store/api/particularAccount/particularAccountApi";
import { useCreateVoucherMutation } from "@/components/store/api/voucher/receiptVoucherApi";

import { generateVoucherNo } from "@/utils/helper/randomValueGenerator";

import HomeLoader from "@/components/loader/HomeLoader";
import ButtonLoader from "@/components/loader/ButtonLoader";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormData,
  receiptVoucherSchema,
} from "@/schemas/voucher/voucherSchema";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import { selectDatePermission } from "@/components/store/store";

const CreateExpanseVoucher = () => {
  const navigate = useNavigate();
  const datePermission = useSelector(selectDatePermission);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [createVoucher, { isLoading: createVoucherLoading }] =
    useCreateVoucherMutation();

  const { data: accounts, isLoading: accountsLoading } =
    useGetAllAccountsParticularQuery({});
  const { data: customers, isLoading: customerLoading } =
    useGetAllExpenseParticularQuery({});

  const selectedBranch = localStorage.getItem("selectedBranch");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(receiptVoucherSchema),
    defaultValues: {
      voucherNo: generateVoucherNo(
        "EV",
        selectedBranch ? JSON.parse(selectedBranch)?.name : "",
      ),
      type: "EXPENSE",
      date: format(new Date(), "yyyy-MM-dd"),
      narration: "",
      entries: [
        { particularId: 0, type: "Debit", amount: 0 },
        { particularId: 0, type: "Credit", amount: 0 },
      ],
    },
  });

  const accountCurrentBalance = customers?.data?.find(
    (account: any) => account?.id === watch("entries")?.[0]?.particularId,
  );
  const customerCurrentBalance = accounts?.data?.find(
    (account: any) => account?.id === watch("entries")?.[1]?.particularId,
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Auto-add second row if only one exists
  useEffect(() => {
    if (fields.length < 2) {
      append({ particularId: 0, type: "Debit", amount: 0 });
    }
  }, [fields, append]);

  if (accountsLoading || customerLoading) return <HomeLoader />;

  // Calculate totals
  const entries = watch("entries");
  const totalDebit = entries
    .filter((e) => e.type === "Debit")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalCredit = entries
    .filter((e) => e.type === "Credit")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      date: date ? format(date, "yyyy-MM-dd") : undefined,
    };

    if (totalDebit !== totalCredit) {
      toast.error("Debit and Credit totals must be equal!");
      return;
    }

    try {
      const result = await createVoucher(payload).unwrap();
      if (result?.success) {
        toast.success("Voucher submitted successfully!");
        navigate("/expanse-voucher");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Submission failed.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 bg-white shadow-sm rounded-lg border border-gray-200 text-sm"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Expense Voucher Information
      </h2>

      {/* Voucher Info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Voucher No */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-gray-600">Voucher No*</Label>
            <Controller
              control={control}
              name="voucherNo"
              render={({ field }) => (
                <Input {...field} className="mt-1 bg-gray-50" />
              )}
            />
          </div>
        </div>

        {/* Date */}
        {(datePermission.read || datePermission.create) && (
          <div>
            <Label className="text-gray-600">Date*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!datePermission.create}
                  className={cn(
                    "w-full justify-between text-left font-normal bg-gray-50 hover:bg-gray-100 h-[48px] rounded-md",
                    !date && "text-muted-foreground",
                    !datePermission.create && "opacity-60 cursor-not-allowed",
                  )}
                >
                  {date ? format(date, "MM-dd-yyyy") : "Pick a date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
                </Button>
              </PopoverTrigger>
              {datePermission.create && (
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setValue("date", d ? format(d, "yyyy-MM-dd") : undefined);
                    }}
                  />
                </PopoverContent>
              )}
            </Popover>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden border rounded-md">
        {/* Header */}
        <div className="grid grid-cols-12 bg-[#efedf7] p-2 font-semibold text-gray-700 text-center">
          <div className="col-span-2">Dr / Cr</div>
          <div className="col-span-5">Particulars</div>
          <div className="col-span-2">Debit</div>
          <div className="col-span-2">Credit</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Dynamic Rows */}
        {fields.map((field, index) => {
          const isAccount = index === 0;
          const options = isAccount ? customers?.data : accounts?.data;

          return (
            <div
              key={field.id}
              className="grid grid-cols-12 items-start border-t p-2 gap-2 text-center"
            >
              {/* Dr/Cr */}
              <div className="col-span-2">
                <Controller
                  control={control}
                  name={`entries.${index}.type`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border border-gray-400">
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Debit">Dr</SelectItem>
                        <SelectItem value="Credit">Cr</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Particulars */}
              <div className="col-span-5">
                <Controller
                  control={control}
                  name={`entries.${index}.particularId`}
                  render={({ field }) => (
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                    >
                      <SelectTrigger className="border border-gray-400">
                        <SelectValue placeholder={"Select one"} />
                      </SelectTrigger>
                      <SelectContent>
                        {options?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.accountType} ({item?.ledger?.ledgerType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {/* {(accountCurrentBalance?.balance === 0 ||
                  accountCurrentBalance?.balance > 0) &&
                  isAccount && (
                    <p className="py-2">
                      CR. BL. # {accountCurrentBalance?.balance}
                    </p>
                  )}
                {(customerCurrentBalance?.balance === 0 ||
                  customerCurrentBalance?.balance > 0) &&
                  !isAccount && (
                    <p className="py-2">
                      CR. BL. # {customerCurrentBalance?.balance}
                    </p>
                  )} */}

                {isAccount && (
                  <p className="py-2 text-left">
                    CR. BL. # {accountCurrentBalance?.balance}
                  </p>
                )}

                {!isAccount && (
                  <p className="py-2 text-left">
                    CR. BL. # {customerCurrentBalance?.balance}
                  </p>
                )}
                {errors.entries?.[index]?.particularId && (
                  <p className="text-red-500 text-xs text-left mt-1">
                    {errors.entries[index].particularId?.message}
                  </p>
                )}
              </div>

              {/* Debit */}
              {/* Debit */}
              <div className="col-span-2">
                <Controller
                  control={control}
                  name={`entries.${index}.amount`}
                  render={({ field }) => (
                    <Input
                      type="number"
                      className="text-center"
                      disabled={watch(`entries.${index}.type`) !== "Debit"}
                      placeholder="0"
                      value={
                        watch(`entries.${index}.type`) === "Debit"
                          ? field.value || ""
                          : "" // hide value when Credit is selected
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, "");
                        field.onChange(Number(val) || 0);
                      }}
                    />
                  )}
                />
              </div>

              {/* Credit */}
              <div className="col-span-2">
                <Controller
                  control={control}
                  name={`entries.${index}.amount`}
                  render={({ field }) => (
                    <Input
                      type="number"
                      className="text-center"
                      disabled={watch(`entries.${index}.type`) !== "Credit"}
                      placeholder="0"
                      value={
                        watch(`entries.${index}.type`) === "Credit"
                          ? field.value || ""
                          : "" // hide value when Debit is selected
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, "");
                        field.onChange(Number(val) || 0);
                      }}
                    />
                  )}
                />
              </div>

              {/* Action */}
              <div className="col-span-1 flex justify-center">
                {index === fields.length - 1 && (
                  <Button
                    size="icon"
                    variant="default"
                    type="button"
                    onClick={() =>
                      append({ particularId: 0, type: "Debit", amount: 0 })
                    }
                  >
                    <FaPlus className="text-white" />
                  </Button>
                )}
                {index === 0 ? (
                  <Button size="icon" variant="default" disabled>
                    <FaPlus className="text-gray-400" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    type="button"
                    onClick={() => {
                      if (fields.length > 2) remove(index);
                    }}
                    disabled={fields.length <= 2}
                  >
                    <FaTrashAlt className="text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Totals */}
        <div className="grid grid-cols-12 gap-2 items-center border-t p-2 font-semibold text-center text-gray-700 bg-gray-50">
          <div className="col-span-7 text-right pr-4">Total</div>
          <div className="col-span-2">
            <Input
              readOnly
              value={totalDebit}
              className="text-center bg-white"
            />
          </div>
          <div className="col-span-2">
            <Input
              readOnly
              value={totalCredit}
              className="text-center bg-white"
            />
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Narration */}
        <div className="mt-6">
          <Label className="text-gray-600">Narration</Label>
          <Controller
            control={control}
            name="narration"
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Add any notes or remarks..."
                className="mt-1 border border-primary-100 focus-visible:ring-0 focus-visible:border-primary-600 transition-colors"
              />
            )}
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          disabled={createVoucherLoading}
          variant="red_outeline"
          onClick={() => navigate("/expanse-voucher")}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={createVoucherLoading || totalDebit !== totalCredit}
          type="submit"
        >
          {createVoucherLoading ? <ButtonLoader /> : <GrNotes className="" />}
          Submit
        </Button>
      </div>
    </form>
  );
};

export default CreateExpanseVoucher;
