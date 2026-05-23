"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { useSelector } from "react-redux";
import { FaFilePdf, FaPrint } from "react-icons/fa6";

import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import { selectCurrentCurrency } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import Heading from "@/components/typography/Heading";
import { ReusableTable } from "@/components/common/ReusableTable";
import HomeLoader from "@/components/loader/HomeLoader";

import StockReportPrint from "@/components/common/PrintPdf/StockReportPrint";
import PdfStockReport from "@/components/common/PrintPdf/PdfStockReport";
import { useGetStockReportQuery } from "@/components/store/api/report/accountingReportApi";

interface StockReportRow {
  productName: string;
  brand: string;
  category: string;
  subCategory: string;
  size: string;

  purchaseQty: number;
  saleQty: number;
  purchaseReturnQty: number;
  saleReturnQty: number;

  currentStock: number;
  
  purchasePrice: number;
  stockValuePurchase: number;
  stockValueSale: number;
  stockValueWholesale: number;
  totalTransfer: number;
}

const InventoryReportPage = () => {
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

  const { data: report, isLoading } =
    useGetStockReportQuery(queryParams);

  const columns: ColumnDef<StockReportRow>[] = [
    {
      accessorKey: "id",
      header: "Index",
      cell: ({ row }) => row.index + 1,
      footer: () => <span className="font-bold text-lg">Total</span>,
    },

    { accessorKey: "productName", header: "Products Name" },
    { accessorKey: "brand", header: "Brand" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "subCategory", header: "Sub-category" },
    { accessorKey: "size", header: "Size" },

    {
      accessorKey: "purchaseQty",
      header: "Total Purchase Quantity",
      footer: () => report?.summary?.totalPurchase || 0,
    },

    {
      accessorKey: "saleQty",
      header: "Total Sale Quantity",
      footer: () => report?.summary?.totalSale || 0,
    },

    {
      accessorKey: "purchaseReturnQty",
      header: "Total Purchase Return Quantity",
      footer: () => report?.summary?.totalPurchaseReturn || 0,
    },

    {
      accessorKey: "saleReturnQty",
      header: "Total Sale Return Quantity",
      footer: () => report?.summary?.totalSaleReturn || 0,
    },

    {
      accessorKey: "currentStock",
      header: "Current Stock",
      footer: () => report?.summary?.totalStock || 0,
    },

    {
      accessorKey: "purchasePrice",
      header: "Per Unit Purchase Price",
      cell: ({ row }) =>
        `${row.original.purchasePrice} ${currentCurrency?.name}`,
      footer: () =>
        `${report?.summary?.totalPurchasePrice?.toFixed(2) || 0} ${currentCurrency?.name}`,
    },

    {
      accessorKey: "stockValuePurchase",
      header: "Current Stock Value (Purchase Price)",
      cell: ({ row }) =>
        `${row.original.stockValuePurchase.toFixed(2)} ${currentCurrency?.name}`,
      footer: () =>
        `${report?.summary?.totalStockValuePurchase?.toFixed(2) || 0} ${currentCurrency?.name}`,
    },

    {
      accessorKey: "stockValueSale",
      header: "Current Stock Value (Sale Price)",
      cell: ({ row }) =>
        `${row.original.stockValueSale.toFixed(2)} ${currentCurrency?.name}`,
      footer: () =>
        `${report?.summary?.totalStockValueSale?.toFixed(2) || 0} ${currentCurrency?.name}`,
    },

    {
      accessorKey: "stockValueWholesale",
      header: "Current Stock Value (Wholesale Price)",
      cell: () =>
        `N/A`,
      footer: () =>
        `0`,
    },

    {
      accessorKey: "totalTransfer",
      header: "Total Transfer",
      cell: () =>
        `N/A`,
      footer: () =>
        `0`,
      
    },
  ];

  const handleSearch = ({ reportType, fromDate, toDate, month, year }: any) => {
    let _fromDate = "";
    let _toDate = "";

    if (reportType === "daily") {
      _fromDate = dayjs(fromDate).format("YYYY-MM-DD");
      _toDate = dayjs(toDate).format("YYYY-MM-DD");
    }

    if (reportType === "monthly") {
      _fromDate = dayjs(`${year}-${month}-01`).startOf("month").format("YYYY-MM-DD");
      _toDate = dayjs(`${year}-${month}-01`).endOf("month").format("YYYY-MM-DD");
    }

    if (reportType === "yearly") {
      _fromDate = `${year}-01-01`;
      _toDate = `${year}-12-31`;
    }

    setQueryParams({ fromDate: _fromDate, toDate: _toDate });
  };

  const handlePrint = () => {
    if (!report) return;

    StockReportPrint(
      { data: report },
      currentCurrency,
      queryParams,
      reportType
    );
  };

  const handleDownloadPdf = () => {
    if (!report) return;

    PdfStockReport(
      { data: report },
      currentCurrency,
      queryParams,
      reportType
    );
  };

  if (isLoading) return <HomeLoader />;

  return (
    <div className="p-6 space-y-6">
      <div className="border p-4 rounded-md bg-white">
        <Heading className="mb-4">Stock And Inventory Report</Heading>

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
          <Button onClick={handlePrint}>
            <FaPrint /> Print
          </Button>

          <Button variant="red" onClick={handleDownloadPdf}>
            <FaFilePdf /> PDF
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <ReusableTable<StockReportRow>
          columns={columns}
          data={report?.rows || []}
        />
      </div>
    </div>
  );
};

export default InventoryReportPage;