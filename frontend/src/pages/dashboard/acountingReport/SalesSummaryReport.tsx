"use client";

import PdfSalesSummaryReport from "@/components/common/PrintPdf/PdfSalesSummaryReport";
import SalesSummaryReportPrint from "@/components/common/PrintPdf/SalesSummaryReportPrint";
import { ReusableTable } from "@/components/common/ReusableTable";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetSalesSummaryReportQuery } from "@/components/store/api/report/accountingReportApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";

interface SalesSummaryRow {
  description: string;
  valueExcl: number;
  vatRate: number;
  vatAmount: number;
  sd: number;
}

const SalesSummaryReport = () => {
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
  const {data: report, isLoading: isReportLoading} = useGetSalesSummaryReportQuery(queryParams);

  const columns: ColumnDef<SalesSummaryRow>[] = [
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
      cell: ({ row }) => (row?.original?.valueExcl ?? 0).toFixed(2),
      footer: () => report?.data?.totals?.totalValueExcl?.toFixed(2),
    },
    {
      accessorKey: "vatRate",
      header: "VAT Rate",
      cell: ({ row }) => `${row?.original?.vatRate}`,
    },
    {
      accessorKey: "vatAmount",
      header: "VAT Amount",
      cell: ({ row }) => (row?.original?.vatAmount ?? 0).toFixed(2),
      footer: () => report?.data?.totals?.totalVatAmount?.toFixed(2),
    },
    {
      accessorKey: "sd",
      header: "SD (Supplementary Duty)",
      cell: ({ row }) => (row?.original?.sd ?? 0).toFixed(2),
      footer: () => report?.data?.totals?.totalSD?.toFixed(2),
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
      _fromDate = dayjs(`${year}-${month}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      _toDate = dayjs(`${year}-${month}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
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
    SalesSummaryReportPrint(
      { data: report?.data },
      currentCurrency,
      queryParams,
      reportType,
    );
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    PdfSalesSummaryReport(
      { data: report?.data },
      currentCurrency,
      queryParams,
      reportType,
    );
  };

  if (isReportLoading) {
    return (
      <HomeLoader />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="border p-4 rounded-md bg-white">
        <Heading className="mb-4">Sales Summary (Output Tax)</Heading>

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
            <FaPrint />
            Print
          </Button>
          <Button
            variant={"red"}
            onClick={handleDownloadPdf}
            disabled={!report}
          >
            <FaFilePdf />
            PDF
          </Button>
        </div>
      </div>

        <ReusableTable<SalesSummaryRow>
          columns={columns}
          data={report?.data?.rows}
        />
    </div>
  );
};

export default SalesSummaryReport;

