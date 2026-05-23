"use client";

import dayjs from "dayjs";
import React, { useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

import BalanceSheetReportPrint from "@/components/common/PrintPdf/BalanceSheetReportPrint";
import PdfBalanceSheetReport from "@/components/common/PrintPdf/PdfBalanceSheetReport";
import { useGetBalanceSheetQuery } from "@/components/store/api/balanceSheet/balanceSheetApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
// Import the common helper
import { formatWithDrCr } from "@/utils/helper/accountingFormat";

const BalanceSheetReport = () => {
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

  const { data, isLoading } = useGetBalanceSheetQuery(
    { ...queryParams },
    { skip: !shouldFetch || !queryParams.fromDate || !queryParams.toDate }
  );

  const report = data?.data;

  const handlePrint = () => {
    if (!report) return;
    BalanceSheetReportPrint({ data: report }, currentCurrency, queryParams, reportType);
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    PdfBalanceSheetReport({ data: report }, currentCurrency, queryParams, reportType);
  };

  return (
    <div className="p-6 space-y-6 bg-zinc-50/50 min-h-screen">
      {/* ===================== Header & Filters ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading className="text-xl font-bold text-zinc-800">Balance Sheet</Heading>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              disabled={!report}
              variant="outline"
              className="bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 transition-all shadow-none"
            >
              <FaPrint className="mr-2 text-primary-500" />
              Print
            </Button>
            <Button
              variant="destructive"
              onClick={handleDownloadPdf}
              disabled={!report}
              className="bg-red-600 hover:bg-red-700 transition-all shadow-none"
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
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary-500 text-white">
                  <th className="px-6 py-4 font-semibold text-left uppercase tracking-wider text-[11px] border-r border-white/10 w-2/5">Account</th>
                  <th className="px-6 py-4 font-semibold text-left uppercase tracking-wider text-[11px] border-r border-white/10">Classification</th>
                  <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider text-[11px] border-r border-white/10">Amount</th>
                  <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider text-[11px]">Subtotal ({currentCurrency?.name})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {/* ===== Assets Section ===== */}
                {report.assets?.map((group, i) => (
                  <React.Fragment key={`asset-group-${i}`}>
                    <tr className="bg-zinc-50/80">
                      <td colSpan={4} className="px-6 py-3 font-bold text-zinc-800 text-base italic border-l-4 border-emerald-500">
                        {group.groupName}
                      </td>
                    </tr>
                    {group.account.map((item, j) => (
                      <tr key={`asset-${j}`} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-3 text-zinc-700 font-medium">{item.account}</td>
                        <td className="px-6 py-3 text-zinc-500 italic">{item.classification}</td>
                        <td className="px-6 py-3 text-right font-semibold text-zinc-600">
                          {formatWithDrCr(item.amount, item.amount >= 0 ? "Dr" : "Cr")}
                        </td>
                        <td className="px-6 py-3 text-right"></td>
                      </tr>
                    ))}
                    <tr className="bg-zinc-50/30">
                      <td className="px-6 py-3 font-bold text-zinc-900">Total {group.groupName}</td>
                      <td colSpan={2} className="px-6 py-3"></td>
                      <td className="px-6 py-3 text-right font-bold text-zinc-800 ">
                        {formatWithDrCr(group.totalAmount, group.totalAmount >= 0 ? "Dr" : "Cr")}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}

                <tr className="bg-emerald-50/50 border-y-2 border-emerald-100">
                  <td className="px-6 py-4 font-black text-emerald-900 text-lg uppercase tracking-tight">TOTAL ASSETS</td>
                  <td colSpan={2}></td>
                  <td className="px-6 py-4 text-right font-black text-emerald-700 text-xl">
                    {formatWithDrCr(report.totalAssets, report.totalAssets >= 0 ? "Dr" : "Cr")}
                  </td>
                </tr>

                <tr className="h-8 bg-white"><td colSpan={4}></td></tr>

                {/* ===== Liabilities Section ===== */}
                {report.liabilities?.map((group, i) => (
                  <React.Fragment key={`liability-group-${i}`}>
                    <tr className="bg-zinc-50/80">
                      <td colSpan={4} className="px-6 py-3 font-bold text-zinc-800 text-base italic border-l-4 border-rose-500">
                        {group.groupName}
                      </td>
                    </tr>
                    {group.account.map((item, j) => (
                      <tr key={`liability-${j}`} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-3 text-zinc-700 font-medium">{item.account}</td>
                        <td className="px-6 py-3 text-zinc-500 italic">{item.classification}</td>
                        <td className="px-6 py-3 text-right font-semibold text-zinc-600">
                          {formatWithDrCr(item.amount, "Cr")}
                        </td>
                        <td className="px-6 py-3 text-right"></td>
                      </tr>
                    ))}
                    <tr className="bg-zinc-50/30">
                      <td className="px-6 py-3 font-bold text-zinc-900">Total {group.groupName}</td>
                      <td colSpan={2} className="px-6 py-3"></td>
                      <td className="px-6 py-3 text-right font-bold text-zinc-800 ">
                        {formatWithDrCr(group.totalAmount, "Cr")}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}

                {/* ===== Owner's Equity ===== */}
                <tr className="bg-zinc-50/80">
                  <td colSpan={4} className="px-6 py-3 font-bold text-zinc-800 text-base italic border-l-4 border-primary-500">
                    Equity
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-3 text-zinc-700 font-medium">Owner's Equity</td>
                  <td className="px-6 py-3 text-zinc-500 italic">Equity Balance</td>
                  <td className="px-6 py-3 text-right font-semibold text-zinc-600">
                    {formatWithDrCr(report.ownerSecurity, "Cr")}
                  </td>
                  <td className="px-6 py-3 text-right"></td>
                </tr>

                <tr className="bg-zinc-100 border-t-4 border-primary-500">
                  <td className="px-4 py-2 font-bold text-lg uppercase tracking-tight">TOTAL LIABILITIES & EQUITY</td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-2 text-right font-black text-2xl text-primary-500">
                    {formatWithDrCr(report.totalLiabilitiesAndEquity, "Cr")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-200">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-medium">Loading Balance Sheet...</p>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetReport;