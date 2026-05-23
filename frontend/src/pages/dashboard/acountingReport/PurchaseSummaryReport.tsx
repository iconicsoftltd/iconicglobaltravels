"use client";

import PdfPurchaseSummaryReport from "@/components/common/PrintPdf/PdfPurchaseSummaryReport";
import PurchaseSummaryReportPrint from "@/components/common/PrintPdf/PurchaseSummaryReportPrint";
import { ReusableTable } from "@/components/common/ReusableTable";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetPurchaseSummaryReportQuery } from "@/components/store/api/report/accountingReportApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

interface PurchaseSummaryRow {
  description: string;
  valueExcl: number;
  vatPaid: number;
  reclaimable: string;
}

const PurchaseSummaryReport = () => {
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
  const { data: report, isLoading } = useGetPurchaseSummaryReportQuery(queryParams);

  const columns: ColumnDef<PurchaseSummaryRow>[] = [
    {
      accessorKey: "id",
      header: "SL",
      cell: ({ row }) => row.index + 1,
      footer: () => <span className="font-bold text-lg">Total:</span>,
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "valueExcl",
      header: "Value (Excl.)",
      cell: ({ row }) => (row.original.valueExcl ?? 0).toFixed(2),
      footer: () => report?.data?.totals?.totalValueExcl?.toFixed(2),
    },
    {
      accessorKey: "vatPaid",
      header: "VAT Paid",
      cell: ({ row }) => (row.original.vatPaid ?? 0).toFixed(2),
      footer: () => report?.data?.totals?.totalVatPaid?.toFixed(2),
    },
    {
      accessorKey: "reclaimable",
      header: "Reclaimable?",
    },
  ];

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
    if (!report) return;
    PurchaseSummaryReportPrint(
      { data: report.data },
      currentCurrency,
      queryParams,
      reportType
    );
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    PdfPurchaseSummaryReport(
      { data: report.data },
      currentCurrency,
      queryParams,
      reportType
    );
  };

  if (isLoading) return <HomeLoader />;

  return (
    <div className="p-6 space-y-6">
      <div className="border p-4 rounded-md bg-white">
        <Heading className="mb-4">Purchase Summary</Heading>

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

        <div className="flex justify-end mt-2 gap-4">
          <Button onClick={handlePrint} disabled={!report}>
            <FaPrint /> Print
          </Button>
          <Button
            variant={"red"}
            onClick={handleDownloadPdf}
            disabled={!report}
          >
            <FaFilePdf /> PDF
          </Button>
        </div>
      </div>

        <ReusableTable<PurchaseSummaryRow>
          columns={columns}
          data={report?.data?.rows || []}
        />
    </div>
  );
};

export default PurchaseSummaryReport;