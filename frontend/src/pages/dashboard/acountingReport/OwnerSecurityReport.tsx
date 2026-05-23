"use client";

import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

import OwnerSecurityReportPrint from "@/components/common/PrintPdf/OwnerSecurityReportPrint";
import PdfOwnerSecurityReport from "@/components/common/PrintPdf/PdfOwnerSecurityReport";
import { useGetOwnerSecurityQuery } from "@/components/store/api/ownerSecurity/ownerSecurityApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import { formatWithDrCr } from "@/utils/helper/accountingFormat";
// Enhanced helper to show "115,000.00 Dr" or "500,000.00 Cr"


const OwnerSecurityReport = () => {

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

  const { data, isLoading } = useGetOwnerSecurityQuery(
    { branchId: 1, ...queryParams },
    { skip: !shouldFetch || !queryParams.fromDate || !queryParams.toDate }
  );

  const report = data?.data;

  const handlePrint = () => {
    if (!report) return;
    OwnerSecurityReportPrint({ data: report }, currentCurrency, queryParams, reportType);
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    PdfOwnerSecurityReport({ data: report }, currentCurrency, queryParams, reportType);
  };

  return (
    <div className="p-6 space-y-6 bg-zinc-50/50 min-h-screen font-sans">
      {/* ===================== Header & Filters ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Heading className="text-xl font-bold text-zinc-800">Owner's Equity Report</Heading>

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
                  <th className="px-6 py-4 font-semibold text-left uppercase tracking-wider text-[11px] border-r border-white/10 w-2/5">Account Name</th>
                  <th className="px-6 py-4 font-semibold text-left uppercase tracking-wider text-[11px] border-r border-white/10">Classification</th>
                  <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider text-[11px] border-r border-white/10">Amount ({currentCurrency?.name})</th>
                  <th className="px-6 py-4 font-semibold text-right uppercase tracking-wider text-[11px]">Subtotal ({currentCurrency?.name})</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {/* Addition Section */}
                <tr className="bg-zinc-50/80">
                  <td colSpan={4} className="px-6 py-3 font-bold text-zinc-800 text-base italic border-l-4 border-emerald-500">
                    Director's Share Equity
                  </td>
                </tr>

                {report.addEquity?.map((item, i) => (
                  <tr key={`add-equity-${i}`} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-3 text-zinc-700 font-medium">{item.account}</td>
                    <td className="px-6 py-3 text-zinc-500 italic">{item.classification}</td>
                    <td className="px-6 py-3 text-right font-semibold text-emerald-600">
                      {formatWithDrCr(item.amount, "Cr")}
                    </td>
                    <td className="px-6 py-3 text-right"></td>
                  </tr>
                ))}

                {/* Net Income Row */}
                <tr className="bg-emerald-50/30">
                  <td className="px-6 py-4 font-bold text-zinc-900 text-base border-l-4 border-emerald-600">
                    Net Income {report?.netIncome >= 0 ? "(PROFIT)" : "(LOSS)"}
                  </td>
                  <td className="px-6 py-4 italic text-zinc-500">Current Period Performance</td>
                  <td className="px-6 py-4"></td>
                  <td className={`px-6 py-4 text-right font-bold text-lg ${report.netIncome < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    {formatWithDrCr(report.netIncome)}
                  </td>
                </tr>

                <tr className="h-6 bg-zinc-50/30"><td colSpan={4}></td></tr>

                {/* Withdrawals Section */}
                <tr className="bg-zinc-50/80">
                  <td colSpan={4} className="px-6 py-3 font-bold text-zinc-800 text-base italic border-l-4 border-rose-500">
                    Less: Withdrawals
                  </td>
                </tr>

                {report.lessEquity?.map((item, i) => (
                  <tr key={`less-equity-${i}`} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-3 text-zinc-700 font-medium">{item.account}</td>
                    <td className="px-6 py-3 text-zinc-500 italic">{item.classification}</td>
                    <td className="px-6 py-3 text-right font-semibold text-rose-600">
                      {formatWithDrCr(item.amount, "Dr")}
                    </td>
                    <td className="px-6 py-3 text-right"></td>
                  </tr>
                ))}

                <tr className="bg-rose-50/30">
                  <td className="px-4 py-4 font-bold text-zinc-900 text-base border-l-4 border-rose-600">Total Withdrawals</td>
                  <td colSpan={2} className="px-4 py-4"></td>
                  <td className="px-4 py-4 text-right font-bold text-rose-700 text-lg   ">
                    {formatWithDrCr(report.lessEquity?.reduce((sum, item) => sum + item.amount, 0), "Dr")}
                  </td>
                </tr>

                {/* Ending Capital Footer */}
                <tr className="bg-zinc-100  border-t-4 border-primary-500">
                  <td className="px-4 py-4 font-bold text-lg uppercase tracking-tight">
                    Ending Capital (DIRECTOR'S SHARE)
                  </td>
                  <td colSpan={2} className="px-4 py-4"></td>
                  <td className={`px-4 py-4 text-right font-black text-2xl ${report.endingCapital < 0 ? "text-rose-500" : "text-primary-500"}`}>
                    {formatWithDrCr(report.endingCapital)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading & Empty States logic remains same */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-200">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-medium">Generating Owner's Equity Report...</p>
        </div>
      )}
    </div>
  );
};

export default OwnerSecurityReport;