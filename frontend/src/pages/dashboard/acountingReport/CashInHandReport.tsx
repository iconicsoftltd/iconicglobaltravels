"use client";

import CashInHandReportPrint from "@/components/common/PrintPdf/CashInHandReportPrint";
import PdfCashInHandReport from "@/components/common/PrintPdf/PdfCashInHandReport";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetCashInHandReportQuery } from "@/components/store/api/report/accountingReportApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import { dateFormatter } from "@/utils/helper/dateFormatter";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaInbox, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

const CashInHandReport = () => {
  // Logic preserved exactly from original
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [, setShouldFetch] = useState(false);
  const [queryParams, setQueryParams] = useState({ fromDate, toDate });

  const currentCurrency = useSelector(selectCurrentCurrency);
  const { data: cashInHandData, isLoading, isFetching } = useGetCashInHandReportQuery(queryParams);

  // Search handler preserved exactly
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

  const handlePrint = () => {
    if (!cashInHandData?.data) return;
    CashInHandReportPrint({ data: cashInHandData?.data }, currentCurrency, queryParams, reportType);
  };

  const handleDownloadPdf = () => {
    if (!cashInHandData?.data) return;
    PdfCashInHandReport({ data: cashInHandData?.data }, currentCurrency, queryParams, reportType);
  };

  if (isLoading || isFetching) return <HomeLoader />;

  const tableRows = cashInHandData?.data?.rows || [];
  const summary = cashInHandData?.data?.summary;

  return (
    <div className="p-6 space-y-6 bg-zinc-50/50 min-h-screen font-sans">
      {/* ===================== Header & Filters ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading className="text-xl font-bold text-zinc-800">Cash In Hand Report</Heading>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handlePrint} 
              disabled={!cashInHandData?.data}
              className="bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-none transition-all active:scale-95"
              variant="outline"
            >
              <FaPrint className="mr-2 text-primary-500" />
              Print
            </Button>
            <Button
              variant="destructive"
              onClick={handleDownloadPdf}
              disabled={!cashInHandData?.data}
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
            showParticular={false}
          />
        </div>
      </div>

      {/* ===================== Report Table ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-primary-500 text-white">
                <th rowSpan={2} className="px-4 py-4 font-semibold text-left border-r border-white/10 uppercase tracking-wider text-[11px]">Date</th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-left border-r border-white/10 uppercase tracking-wider text-[11px]">Description</th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-center border-r border-white/10 uppercase tracking-wider text-[11px]">V.N./J.N.</th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-right border-r border-white/10 uppercase tracking-wider text-[11px]">Debit</th>
                <th rowSpan={2} className="px-4 py-4 font-semibold text-right border-r border-white/10 uppercase tracking-wider text-[11px]">Credit</th>
                <th colSpan={2} className="px-4 py-2 font-semibold text-center border-b border-white/10 uppercase tracking-wider text-[11px]">Running Balance</th>
              </tr>
              <tr className="bg-primary-600 text-white/90">
                <th className="px-4 py-2 text-right text-[10px] uppercase border-r border-white/10">Debit</th>
                <th className="px-4 py-2 text-right text-[10px] uppercase">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {tableRows.length > 0 ? (
                tableRows.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-primary-50/30 transition-colors">
                    <td className="px-4 py-3 text-zinc-600 border-r border-zinc-50 whitespace-nowrap">
                      {dateFormatter(row.date)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 font-medium">
                      {row.description}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-500 font-mono">
                      {row.voucherNo}
                    </td>
                    {/* <td className="px-4 py-3 text-right text-emerald-600 font-semibold italic"> */}
                    <td className="px-4 py-3 text-right  font-semibold italic">
                      {row.debit || "-"}
                    </td>
                    {/* <td className="px-4 py-3 text-right text-rose-600 font-semibold italic"> */}
                    <td className="px-4 py-3 text-right  font-semibold italic">
                      {row.credit || "-"}
                    </td>
                    <td className="px-4 py-3 text-right bg-zinc-50/50 text-zinc-800 font-bold group-hover:bg-transparent">
                      {row.balanceDebit}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 italic">
                      {row.balanceCredit}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <FaInbox size={40} className="mb-2" />
                      <p className="font-medium text-lg">No records found for selected dates</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Spacer Row */}
              <tr className="bg-zinc-50/20">
                {Array(7).fill(0).map((_, i) => <td key={i}></td>)}
              </tr>

              {/* Footer Balance Row */}
              <tr className="bg-zinc-100 border-t-2 border-red-500">
                <td className="px-4 py-2 text-center font-bold italic text-zinc-400">
                  Total
                </td>
                <td className="px-4 py-2 font-bold text-zinc-800 uppercase tracking-tight">
                  Balance c/d
                </td>
                <td colSpan={3} className="px-4 py-2"></td>
                <td className="px-4 py-2 text-right text-primary-700 font-black text-base border-r border-zinc-200">
                  {summary?.totalBalanceDebit || "0.00"}
                </td>
                <td className="px-4 py-2 text-right text-zinc-700 font-black text-base">
                  {summary?.totalBalanceCredit || "0.00"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashInHandReport;