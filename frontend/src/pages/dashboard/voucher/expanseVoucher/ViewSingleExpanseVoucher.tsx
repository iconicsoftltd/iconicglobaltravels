import { useVoucherPrint } from "@/components/common/voucherPrintPdf/VoucherPrint";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetVoucherByIdQuery } from "@/components/store/api/voucher/receiptVoucherApi";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import { appConfiguration } from "@/utils/constant/appConfiguration";
import { FaMailBulk } from "react-icons/fa";
import { FaEarthAfrica, FaLocationArrow, FaPhone } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";
import { useParams } from "react-router-dom";
import numberToWords from "number-to-words";

const ViewSingleExpanseVoucher = () => {
  const { id } = useParams();

  const { data: singleVoucher, isLoading: isSingleVoucherLoading } =
    useGetVoucherByIdQuery(id);
  const { printVoucher } = useVoucherPrint();

  if (isSingleVoucherLoading) return <HomeLoader />;
  if (!singleVoucher?.data) return <p>No voucher found</p>;

  const voucher = singleVoucher.data;

  // ✅ Calculate totals
  const totalDebit = voucher.particulars
    .filter((p) => p.type === "Debit")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalCredit = voucher.particulars
    .filter((p) => p.type === "Credit")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // ✅ Convert total amount to words
  const amountInWords =
    numberToWords
      .toWords(totalDebit || totalCredit)
      .replace(/^\w/, (c) => c.toUpperCase()) + " Taka Only";

  // ✅ Prepare data for print
  const voucherData = {
    config: {
      logo: appConfiguration?.logo,
      address: appConfiguration?.address,
      email: appConfiguration?.email,
      phone: appConfiguration?.phone,
      website: appConfiguration?.website,
    },
    voucherNo: voucher.voucherNo,
    date: new Date(voucher.date).toLocaleDateString(),
    rows: voucher.particulars.map((p) => ({
      type: p.type,
      particulars: p.particular?.accountType || "N/A",
      debit: p.type === "Debit" ? p.amount : 0,
      credit: p.type === "Credit" ? p.amount : 0,
    })),
    totalDebit,
    totalCredit,
    amountInWords,
  };

  return (
    <div className="p-6 bg-white shadow-sm rounded-lg border border-gray-200 text-sm">
      <Heading className="font-semibold mb-4">
        Expense Voucher Information
      </Heading>

      {/* Company Header */}
      <div className="items-center text-center border-b border-t py-5 border-gray-200 mb-6">
        <div className="flex justify-center items-center mb-2 w-48 mx-auto">
          <img
            src={appConfiguration?.logo}
            alt="logo"
            className="w-auto object-contain"
          />
        </div>

        <div className="flex justify-center items-center gap-2 text-gray-700 text-base font-medium mb-1">
          <FaLocationArrow className="text-gray-500" />
          <span>{appConfiguration?.address}</span>
        </div>

        <div className="flex justify-center items-center gap-4 text-gray-600 text-sm mb-1">
          <div className="flex items-center gap-2">
            <FaMailBulk className="text-gray-500" />
            <span>{appConfiguration?.email}</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-2">
            <FaPhone className="text-gray-500" />
            <span>{appConfiguration?.phone}</span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 text-gray-600 text-sm">
          <FaEarthAfrica className="text-gray-500" />
          <span>{appConfiguration?.website}</span>
        </div>
      </div>

      {/* Header */}
      <h2 className="text-2xl text-[#5e48d8] font-semibold text-center mb-4">
        Expense Voucher
      </h2>

      <div className="flex justify-between gap-4 mb-6 text-[#5e48d8] font-medium">
        <div>
          <label className="block mb-1">Voucher No: {voucher.voucherNo}</label>
        </div>
        <div>
          <label className="block mb-1">
            Date: {new Date(voucher.date).toLocaleDateString()}
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-12 bg-[#efedf7] p-2 font-semibold text-gray-700 text-center border-b border-gray-200">
          <div className="col-span-1 text-[#5e48d8] font-medium">S/L</div>
          <div className="col-span-2 text-[#5e48d8] font-medium">
            Debit / Credit
          </div>
          <div className="col-span-4 text-[#5e48d8] font-medium">
            Particulars
          </div>
          <div className="col-span-2 text-[#5e48d8] font-medium">Debit</div>
          <div className="col-span-3 text-[#5e48d8] font-medium">Credit</div>
        </div>

        {voucher.particulars.map((p, index) => (
          <div
            key={p.id}
            className="grid grid-cols-12 items-center text-center gap-2"
          >
            <div className="px-3 py-2 col-span-1 border mt-2 font-medium text-gray-800">
              {index + 1}
            </div>
            <div className="col-span-2 px-3 py-2 border mt-2 font-medium text-gray-800">
              {p.type}
            </div>
            <div className="col-span-4 px-3 py-2 border mt-2 font-medium text-gray-800  pl-4 text-center">
              {p.particular?.accountType || "N/A"}
            </div>
            <div className="col-span-2 px-3 py-2 border mt-2 font-medium text-gray-800">
              {p.type === "Debit" ? p.amount.toFixed(2) : "0.00"}
            </div>
            <div className="col-span-3 px-3 py-2 border mt-2 font-medium text-gray-800">
              {p.type === "Credit" ? p.amount.toFixed(2) : "0.00"}
            </div>
          </div>
        ))}

        {/* Totals */}
        <div className="grid grid-cols-12 p-2 font-semibold text-center text-gray-700 bg-gray-50 gap-2">
          <div className="col-span-7 mt-2 text-right pr-4">Total Amount:</div>
          <div className="col-span-2 px-3 py-2 border border-[#e4e0ff] font-medium text-gray-800">
            {totalDebit.toFixed(2)}
          </div>
          <div className="col-span-3 px-3 py-2 border border-[#e4e0ff] font-medium text-gray-800">
            {totalCredit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mt-4 p-3 bg-[#efedf7] border border-gray-200 rounded-md">
        <p className="text-gray-700 font-medium text-center">
          (IN WORD: {amountInWords})
        </p>
      </div>

      {/* Notes */}
      {voucher.narration && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
          <p>{voucher.narration}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex justify-between gap-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm underline">Authorised By</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm underline">Account</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm underline">Signature</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={() => printVoucher(voucherData)}
          variant="outline"
          className="hover:bg-[#6E56CF] bg-primary hover:text-white text-white px-6 rounded-none flex items-center gap-2"
        >
          <span>Print</span>
          <GrNotes />
        </Button>
        <Button
          variant="outline"
          className="border border-red-300 text-red-500 hover:bg-red-50 px-6 rounded-none"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ViewSingleExpanseVoucher;
