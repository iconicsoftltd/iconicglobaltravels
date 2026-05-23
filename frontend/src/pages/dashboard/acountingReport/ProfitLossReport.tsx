"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaInbox, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

import PdfProfitLossReport from "@/components/common/PrintPdf/PdfProfitLossReport";
import ProfitLossReportPrint from "@/components/common/PrintPdf/ProfitLossReportPrint";
import { useGetProfitAndLossQuery } from "@/components/store/api/report/accountingReportApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
// Import your common helper
import { formatWithDrCr } from "@/utils/helper/accountingFormat";

interface ProfitLossData {
  totalSales: number;
  purchaseAmount: number;
  revenueAfterCOGS: number;
  adminExpenses: number;
  sellingExpenses: number;
  grossProfit: number;
  nonOperatingIncome: number;
  earningBeforeTax: number;
  taxAmount: number;
  earningAfterTax: number;
}

const ProfitLossReport = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [queryParams, setQueryParams] = useState({ fromDate, toDate });

  const currentCurrency = useSelector(selectCurrentCurrency);

  const handleSearch = ({ reportType, fromDate, toDate, month, year }: any) => {
    let _fromDate = "";
    let _toDate = "";

    if (reportType === "daily") {
      if (!fromDate || !toDate) return;
      _fromDate = dayjs(fromDate).format("YYYY-MM-DD");
      _toDate = dayjs(toDate).format("YYYY-MM-DD");
    } else if (reportType === "monthly") {
      if (!month || !year) return;
      _fromDate = dayjs(`${year}-${month}-01`).startOf("month").format("YYYY-MM-DD");
      _toDate = dayjs(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD");
    } else if (reportType === "yearly") {
      if (!year) return;
      _fromDate = `${year}-01-01`;
      _toDate = `${year}-12-31`;
    }

    setQueryParams({ fromDate: _fromDate, toDate: _toDate });
    setShouldFetch(true);
  };

  const { data, isLoading } = useGetProfitAndLossQuery(
    { ...queryParams },
    { skip: !shouldFetch || !queryParams.fromDate || !queryParams.toDate }
  );

  const report: ProfitLossData | undefined = data?.data;

  const handlePrint = () => {
    if (!report) return;
    ProfitLossReportPrint({ data: report }, currentCurrency, queryParams, reportType);
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    PdfProfitLossReport({ data: report }, queryParams, reportType);
  };

  return (
    <div className="p-6 space-y-6 bg-zinc-50/50 min-h-screen">
      {/* ===================== Header & Filters ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading className="text-xl font-bold text-zinc-800">Profit & Loss Statement</Heading>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              disabled={!report}
              variant="outline"
              className="bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 transition-all shadow-none"
            >
              <FaPrint className="mr-2 text-primary-500" /> Print
            </Button>
            <Button
              variant="destructive"
              onClick={handleDownloadPdf}
              disabled={!report}
              className="bg-red-600 hover:bg-red-700 transition-all shadow-none"
            >
              <FaFilePdf className="mr-2" /> PDF
            </Button>
          </div>
        </div>

        <div className="p-5 bg-zinc-50/30">
          <ReportDateSelector
            reportType={reportType}
            setReportType={setReportType}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* ===================== Styled Report Table ===================== */}
      {!isLoading && report && (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden max-w-4xl mx-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary-500 text-white">
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-[11px]">Description</th>
                <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-[11px]">Amount ({currentCurrency?.name})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {/* --- Trading Account Section --- */}
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-zinc-700 font-medium">Total Sales Revenue</td>
                {/* <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatWithDrCr(report.totalSales, "Cr")}</td> */}
                <td className="px-6 py-4 text-right font-bold ">{formatWithDrCr(report.totalSales, "Cr")}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-zinc-700 font-medium">Total Sales</td>
                {/* <td className="px-6 py-4 text-right font-bold text-rose-600">{formatWithDrCr(report.purchaseAmount, "Dr")}</td> */}
                <td className="px-6 py-4 text-right font-bold ">{formatWithDrCr(report.purchaseAmount, "Dr")}</td>
              </tr>
              <tr className="bg-zinc-50 font-bold border-t border-zinc-200">
                <td className="px-6 py-4 text-zinc-900 italic">Gross Profit</td>
                <td className="px-6 py-4 text-right text-zinc-900 border-b-2 border-double border-zinc-300">
                  {formatWithDrCr(report.grossProfit)}
                </td>
              </tr>

              {/* --- Operating Expenses Section --- */}
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-zinc-700 font-medium pl-10">Administrative Expenses</td>
                {/* <td className="px-6 py-4 text-right text-rose-600 font-semibold">{formatWithDrCr(report.adminExpenses, "Dr")}</td> */}
                <td className="px-6 py-4 text-right  font-semibold">{formatWithDrCr(report.adminExpenses, "Dr")}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-zinc-700 font-medium pl-10">Selling & Distribution Expenses</td>
                {/* <td className="px-6 py-4 text-right text-rose-600 font-semibold">{formatWithDrCr(report.sellingExpenses, "Dr")}</td> */}
                <td className="px-6 py-4 text-right  font-semibold">{formatWithDrCr(report.sellingExpenses, "Dr")}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-zinc-700 font-medium pl-10">Other Non-Operating Income</td>
                {/* <td className="px-6 py-4 text-right text-emerald-600 font-semibold">{formatWithDrCr(report.nonOperatingIncome, "Cr")}</td> */}
                <td className="px-6 py-4 text-right  font-semibold">{formatWithDrCr(report.nonOperatingIncome, "Cr")}</td>
              </tr>

              {/* --- EBT Section --- */}
              <tr className="bg-zinc-50 font-bold">
                <td className="px-6 py-4 text-zinc-900 italic">Earnings Before Tax (EBT)</td>
                <td className="px-6 py-4 text-right text-zinc-900 border-b-2 border-double border-zinc-300" >
                  {formatWithDrCr(report.earningBeforeTax)}
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-zinc-700 font-medium">Income Tax Expense</td>
                {/* <td className="px-6 py-4 text-right text-rose-600 font-semibold">{formatWithDrCr(report.taxAmount, "Dr")}</td> */}
                <td className="px-6 py-4 text-right font-semibold">{formatWithDrCr(report.taxAmount, "Dr")}</td>
              </tr>

              {/* --- Final Result --- */}
              <tr className="bg-zinc-100 ">
                <td className="px-4 py-4 font-bold uppercase tracking-tight">Net Earnings After Tax</td>
                <td className={`px-4 py-4 text-right font-black  ${report.earningAfterTax < 0 ? "text-red-400" : "text-primary-400"}`}>
                  {formatWithDrCr(report.earningAfterTax)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Loading & Empty States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-200">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-medium">Calculating Profit & Loss...</p>
        </div>
      )}

      {!isLoading && !report && shouldFetch && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-zinc-300">
          <FaInbox className="text-zinc-300 text-5xl mb-4" />
          <p className="text-zinc-500 font-medium text-lg">No data for the selected timeframe.</p>
        </div>
      )}
    </div>
  );
};

export default ProfitLossReport;