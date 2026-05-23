"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { GrNotes } from "react-icons/gr";

import { useGetParticularOptionsQuery } from "@/components/store/api/particularAccount/particularAccountApi";
import { useCreateVoucherMutation } from "@/components/store/api/voucher/receiptVoucherApi";

import { generateVoucherNo } from "@/utils/helper/randomValueGenerator";

import ButtonLoader from "@/components/loader/ButtonLoader";
import HomeLoader from "@/components/loader/HomeLoader";
import {
  FormData,
  receiptVoucherSchema,
} from "@/schemas/voucher/voucherSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectDatePermission } from "@/components/store/store";
const CreateJournalVoucher = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());

  // ✅ SEARCH STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const datePermission = useSelector(selectDatePermission);
  console.log("date permission", datePermission);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [createVoucher, { isLoading: createVoucherLoading }] =
    useCreateVoucherMutation();

  // ✅ SEARCHABLE API CALL
  const { data: accounts, isLoading: accountsLoading } =
    useGetParticularOptionsQuery({
      search: debouncedSearch,
    });

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
        "JV",
        selectedBranch ? JSON.parse(selectedBranch)?.name : "",
      ),
      type: "JOURNAL",
      date: format(new Date(), "yyyy-MM-dd"),
      narration: "",
      entries: [
        { particularId: 0, type: "Debit", amount: 0 },
        { particularId: 0, type: "Credit", amount: 0 },
      ],
    },
  });

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

  if (accountsLoading && !debouncedSearch) return <HomeLoader />;

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
        navigate("/journal-voucher");
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
        Journal Voucher Information
      </h2>

      {/* Voucher Info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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

        {/* date section */}
        {(datePermission.read || datePermission.create) && ( // ✅ read অথবা create
          <div>
            <Label className="text-gray-600">Date*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!datePermission.create} // ✅ create না থাকলে disabled
                  className={cn(
                    "w-full justify-between text-left font-normal bg-gray-50 hover:bg-gray-100 h-[48px] rounded-md mt-1",
                    !date && "text-muted-foreground",
                    !datePermission.create && "opacity-60 cursor-not-allowed",
                  )}
                >
                  {date ? format(date, "MM-dd-yyyy") : "Pick a date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
                </Button>
              </PopoverTrigger>
              {datePermission.create && ( // ✅ create থাকলেই calendar খুলবে
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
        <div className="grid grid-cols-12 bg-[#efedf7] p-2 font-semibold text-gray-700 text-center">
          <div className="col-span-2">Dr / Cr</div>
          <div className="col-span-5">Particulars</div>
          <div className="col-span-2">Debit</div>
          <div className="col-span-2">Credit</div>
          <div className="col-span-1">Action</div>
        </div>

        {fields.map((field, index) => {
          // Find current balance for the selected item in this specific row
          const selectedId = watch(`entries.${index}.particularId`);
          const currentAccount = accounts?.data?.find(
            (acc: any) => acc.value === selectedId,
          );

          return (
            <div
              key={field.id}
              className="grid grid-cols-12 items-start border-t p-2 gap-2 text-center"
            >
              <div className="col-span-2">
                <Controller
                  control={control}
                  name={`entries.${index}.type`}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border border-gray-400">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Debit">Dr</SelectItem>
                        <SelectItem value="Credit">Cr</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="col-span-5">
                <Controller
                  control={control}
                  name={`entries.${index}.particularId`}
                  render={({ field }) => (
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value?.toString()}
                      onOpenChange={(open) => !open && setSearchTerm("")}
                    >
                      <SelectTrigger className="border border-gray-400">
                        <SelectValue placeholder="Select Particular" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {accountsLoading && (
                          <p className="p-2 text-xs text-gray-500">
                            Searching...
                          </p>
                        )}
                        {accounts?.data?.map((item: any) => (
                          <SelectItem
                            key={item.value}
                            value={item.value.toString()}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {currentAccount && (
                  <p className="py-2 text-left text-xs font-medium text-blue-600">
                    CR. BL. # {currentAccount.balance ?? 0}
                  </p>
                )}
                {errors.entries?.[index]?.particularId && (
                  <p className="text-red-500 text-xs text-left mt-1">
                    {errors.entries[index].particularId?.message}
                  </p>
                )}
              </div>

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
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, "");
                        field.onChange(Number(val) || 0);
                      }}
                    />
                  )}
                />
              </div>

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
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/^0+(?=\d)/, "");
                        field.onChange(Number(val) || 0);
                      }}
                    />
                  )}
                />
              </div>

              <div className="col-span-1 flex justify-center gap-1">
                {index === fields.length - 1 && (
                  <Button
                    size="icon"
                    type="button"
                    onClick={() =>
                      append({ particularId: 0, type: "Debit", amount: 0 })
                    }
                  >
                    <FaPlus className="text-white h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="outline"
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                >
                  <FaTrashAlt className="text-red-600 h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Totals Row */}
        <div className="grid grid-cols-12 gap-2 items-center border-t p-2 font-semibold text-gray-700 bg-gray-50">
          <div className="col-span-7 text-right pr-4 text-sm">Total</div>
          <div className="col-span-2">
            <Input
              readOnly
              value={totalDebit}
              className="text-center bg-white h-8"
            />
          </div>
          <div className="col-span-2">
            <Input
              readOnly
              value={totalCredit}
              className="text-center bg-white h-8"
            />
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-6">
        <div>
          <Label className="text-gray-600">Note / Narration</Label>
          <Controller
            control={control}
            name="narration"
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Enter journal narration..."
                className="mt-1 border border-gray-300 focus-visible:ring-primary-600"
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/journal-voucher")}
        >
          Cancel
        </Button>
        <Button
          disabled={
            createVoucherLoading ||
            totalDebit !== totalCredit ||
            totalDebit === 0
          }
          type="submit"
          className="min-w-[120px]"
        >
          {createVoucherLoading ? (
            <ButtonLoader />
          ) : (
            <>
              <GrNotes className="mr-2" /> Submit
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateJournalVoucher;
