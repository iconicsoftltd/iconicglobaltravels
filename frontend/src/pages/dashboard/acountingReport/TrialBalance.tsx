"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaInbox, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

import PdfTrialBalanceReport2 from "@/components/common/PrintPdf/PdfTrialBalanceReport2";
import TrialBalanceReportPrint2 from "@/components/common/PrintPdf/TrialBalanceReportPrint2";
import CashSummaryTable, { CashFlowData } from "@/components/dashboard/accounting-report/trial-balance/CashSummaryTable";
import HomeLoader from "@/components/loader/HomeLoader";
import { useFetchTrialBalanceQuery } from "@/components/store/api/report/accountingReportApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";

export default function TrialBalancePage() {
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [queryParams, setQueryParams] = useState({ fromDate, toDate });

  const currentCurrency = useSelector(selectCurrentCurrency);
  const { data: trialBalanceData, isLoading, isError } = useFetchTrialBalanceQuery(queryParams);

  const handleSearch = ({ reportType, fromDate, toDate, month, year }: any) => {
    let _fromDate = "";
    let _toDate = "";
    if (reportType === "daily") {
      _fromDate = dayjs(fromDate).format("YYYY-MM-DD");
      _toDate = dayjs(toDate).format("YYYY-MM-DD");
    } else if (reportType === "monthly") {
      _fromDate = dayjs(`${year}-${month}-01`).startOf("month").format("YYYY-MM-DD");
      _toDate = dayjs(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD");
    } else if (reportType === "yearly") {
      _fromDate = `${year}-01-01`;
      _toDate = `${year}-12-31`;
    }
    setQueryParams({ fromDate: _fromDate, toDate: _toDate });
  };

  const handlePrint = () => TrialBalanceReportPrint2(trialBalanceData?.data, currentCurrency, queryParams, reportType);
  const handleDownloadPdf = () => PdfTrialBalanceReport2(trialBalanceData?.data, currentCurrency, queryParams, reportType);

  if (isLoading) return <HomeLoader />;

  return (
    <div className="p-6 space-y-6 bg-zinc-50/50 min-h-screen">
      {/* ===================== Header & Filters ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading className="text-xl font-bold text-zinc-800">Trial Balance Statement</Heading>
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              disabled={!trialBalanceData?.data}
              variant="outline"
              className="bg-white text-zinc-700 border-zinc-200 shadow-none"
            >
              <FaPrint className="mr-2 text-primary-500" /> Print
            </Button>
            <Button
              variant="destructive"
              onClick={handleDownloadPdf}
              disabled={!trialBalanceData?.data}
              className="bg-red-600 shadow-none"
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

      {/* ===================== Report Body ===================== */}
      {isError ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-600 font-medium text-center">
          Failed to fetch Trial Balance. Please check your connection.
        </div>
      ) : trialBalanceData?.data ? (
        <CashSummaryTable data={trialBalanceData.data as CashFlowData} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-zinc-300">
          <FaInbox className="text-zinc-200 text-6xl mb-4" />
          <p className="text-zinc-500 font-medium">No records found for this period.</p>
        </div>
      )}
    </div>
  );
}