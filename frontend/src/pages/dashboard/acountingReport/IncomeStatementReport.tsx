"use client";

import { useGetIncomeStatementQuery } from "@/components/store/api/incomeStatement/incomeStatementApi";
import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaInbox, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

import IncomeStatementReportPrint from "@/components/common/PrintPdf/IncomeStatementReportPrint";
import PdfIncomeStatementReport from "@/components/common/PrintPdf/PdfIncomeStatementReport";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import { formatWithDrCr } from "@/utils/helper/accountingFormat";

const IncomeStatementReport = () => {
  // --- State & Logic ---
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(
    dayjs(`${currentYear}-${currentMonth}-01`).format("YYYY-MM-DD")
  );
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

  const { data, isLoading } = useGetIncomeStatementQuery(
    { branchId: 1, ...queryParams },
    { skip: !shouldFetch || !queryParams.fromDate || !queryParams.toDate }
  );

  const report = data?.data;

  const handlePrint = () => {
    if (!report) return;
    IncomeStatementReportPrint({ data: report }, currentCurrency, queryParams, reportType);
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    PdfIncomeStatementReport({ data: report }, currentCurrency, queryParams, reportType);
  };

  return (
    <div className="p-6 space-y-6 bg-zinc-50/50 min-h-screen">
      {/* ===================== Header & Filters ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading className="text-xl font-bold text-zinc-800">Income Statement</Heading>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              disabled={!report}
              variant="outline"
              className="bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-none transition-all active:scale-95"
            >
              <FaPrint className="mr-2 text-primary-500" />
              Print
            </Button>
            <Button
              variant="destructive"
              onClick={handleDownloadPdf}
              disabled={!report}
              className="bg-red-600 hover:bg-red-700 shadow-none transition-all active:scale-95"
            >
              <FaFilePdf className="mr-2" />
              PDF
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

      {/* ===================== Report Table ===================== */}
      {!isLoading && report && (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary-500 text-white">
                  <th className="px-6 py-4 font-semibold text-left uppercase tracking-wider text-[11px] border-r border-white/10 w-2/5">
                    Account Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-left uppercase tracking-wider text-[11px] border-r border-white/10">
                    Classification
                  </th>
                  <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider text-[11px] border-r border-white/10">
                    Amount ({currentCurrency?.name})
                  </th>
                  <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider text-[11px]">
                    Subtotal ({currentCurrency?.name})
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {/* ----- Revenue Section ----- */}
                <tr className="bg-zinc-50/80">
                  <td colSpan={4} className="px-6 py-3 font-bold text-zinc-800 text-base italic border-l-4 border-emerald-500">
                    Revenue
                  </td>
                </tr>

                {report.revenue?.map((item, i) => (
                  <tr key={`rev-${i}`} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-3 text-zinc-700 font-medium">{item.account}</td>
                    <td className="px-6 py-3 text-zinc-500 italic">{item.classification}</td>
                    {/* <td className="px-6 py-3 text-right font-semibold text-emerald-600"> */}
                    <td className="px-6 py-3 text-right font-semibold ">
                      {formatWithDrCr(item.amount,item.amount >= 0 ? "Dr" : "Cr")}
                    </td>
                    <td className="px-6 py-3 text-right"></td>
                  </tr>
                ))}

                <tr className="bg-emerald-50/30">
                  <td className="px-6 py-4 font-bold text-zinc-900">Total Revenue</td>
                  <td colSpan={2} className="px-6 py-4"></td>
                  {/* <td className="px-6 py-4 text-right font-bold text-emerald-700 text-lg "> */}
                  <td className="px-6 py-4 text-right font-bold  text-lg ">
                    {formatWithDrCr(report.totalRevenue,report.totalRevenue >=0?"Dr": "Cr")}
                  </td>
                </tr>

                <tr className="h-6 bg-zinc-50/30"><td colSpan={4}></td></tr>

                {/* ----- Expenses Section ----- */}
                <tr className="bg-zinc-50/80">
                  <td colSpan={4} className="px-6 py-3 font-bold text-zinc-800 text-base italic border-l-4 border-rose-500">
                    Operating Expenses
                  </td>
                </tr>

                {report.expense?.map((item, i) => (
                  <tr key={`exp-${i}`} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-3 text-zinc-700 font-medium">{item.account}</td>
                    <td className="px-6 py-3 text-zinc-500 italic">{item.classification}</td>
                    {/* <td className="px-6 py-3 text-right font-semibold text-rose-600"> */}
                    <td className="px-6 py-3 text-right font-semibold ">
                      {formatWithDrCr(item.amount, "Dr")}
                    </td>
                    <td className="px-6 py-3 text-right"></td>
                  </tr>
                ))}

                <tr className="bg-rose-50/30">
                  <td className="px-4 py-4 font-bold text-zinc-900">Total Expenses</td>
                  <td colSpan={2} className="px-4 py-4"></td>
                  {/* <td className="px-4 py-4 text-right font-bold text-rose-700 text-lg "> */}
                  <td className="px-4 py-4 text-right font-bold  text-lg ">
                    {formatWithDrCr(report.totalExpense, "Dr")}
                  </td>
                </tr>

                {/* ----- Net Income Footer ----- */}
                <tr className="bg-zinc-100 border-t-4 border-primary-500">
                  <td className="px-4 py-4 font-bold text-lg uppercase tracking-tight">
                    Net Income {report?.netIncome >= 0 ? "(PROFIT)" : "(LOSS)"}
                  </td>
                  <td colSpan={2} className="px-4 py-4"></td>
                  <td className={`px-4 py-4 text-right font-black text-2xl ${report.netIncome < 0 ? "text-rose-500" : "text-primary-500"}`}>
                    {formatWithDrCr(report.netIncome)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading & Empty States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-200">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-medium">Calculating Statement...</p>
        </div>
      )}

      {!isLoading && !report && shouldFetch && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-zinc-300">
          <FaInbox className="text-zinc-300 text-5xl mb-4" />
          <p className="text-zinc-500 font-medium text-lg">No data found for this period.</p>
        </div>
      )}
    </div>
  );
};

export default IncomeStatementReport;