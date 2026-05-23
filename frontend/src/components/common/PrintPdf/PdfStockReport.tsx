import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const PdfStockReport = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string,
) => {
  const logo = appConfiguration.logo;
  const report = reportData?.data;

  const doc = new jsPDF("landscape", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  /* Header */

  if (logo) {
    doc.addImage(logo, "PNG", (pageWidth - 40) / 2, margin, 40, 12);
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");

  doc.text("Stock And Inventory Report", pageWidth / 2, margin + 22, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Period: ${reportType}`, margin, margin + 30);
  doc.text(`From: ${queryParams.fromDate}`, margin + 60, margin + 30);
  doc.text(`To: ${queryParams.toDate}`, margin + 120, margin + 30);

  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    margin + 36,
    { align: "center" },
  );

  /* Body */

  const body =
    report?.rows?.map((row: any, index: number) => [
      index + 1,
      row.productName,
      row.brand,
      row.category,
      row.subCategory,
      row.size,
      row.purchaseQty,
      row.saleQty,
      row.purchaseReturnQty,
      row.saleReturnQty,
      row.currentStock,

      {
        content: `${currentCurrency.name} ${row.purchasePrice?.toFixed(2)}`,
        styles: { halign: "right" },
      },

      {
        content: `${currentCurrency.name} ${row.stockValuePurchase?.toFixed(2)}`,
        styles: { halign: "right" },
      },

      {
        content: `${currentCurrency.name} ${row.stockValueSale?.toFixed(2)}`,
        styles: { halign: "right" },
      },

      // stockValueWholesale
      {
        content: `N/A`,
        styles: { halign: "right" },
      },

      // row.totalTransfer
      `N/A`,
    ]) || [];

  /* Totals */
  body.push([
    {
      content: "Total",
      colSpan: 6,
      styles: { fontStyle: "bold", halign: "right" },
    },

    report?.summary?.totalPurchase || 0,
    report?.summary?.totalSale || 0,
    report?.summary?.totalPurchaseReturn || 0,
    report?.summary?.totalSaleReturn || 0,
    report?.summary?.totalStock || 0,

    {
      content: `${currentCurrency.name} ${report?.summary?.totalPurchasePrice?.toFixed(
        2,
      )}`,
      styles: { fontStyle: "bold", halign: "right" },
    },
    {
      content: `${currentCurrency.name} ${report?.summary?.totalStockValuePurchase?.toFixed(
        2,
      )}`,
      styles: { fontStyle: "bold", halign: "right" },
    },

    {
      content: `${currentCurrency.name} ${report?.summary?.totalStockValueSale?.toFixed(
        2,
      )}`,
      styles: { fontStyle: "bold", halign: "right" },
    },

    // stockValueWholesale
    {
      content: `0`,
      styles: { fontStyle: "bold", halign: "right" },
    },

    // totalTransfer
    {
      content: `0`,
      styles: { fontStyle: "bold", halign: "right" },
    },
  ]);

  autoTable(doc, {
    startY: margin + 42,

    head: [
      [
        "SL",
        "Product",
        "Brand",
        "Category",
        "Sub Category",
        "Size",
        "Purchase",
        "Sale",
        "Purchase Return",
        "Sale Return",
        "Stock",
        "Unit Price",
        "Stock Value (Purchase)",
        "Stock Value (Sale)",
        "Stock Value (Wholesale)",
        "Transfer",
      ],
    ],

    body,

    theme: "grid",

    styles: {
      fontSize: 7,
      cellPadding: 2,
    },

    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },

    margin: { left: margin, right: margin },
  });

  doc.save(`stock-report-${dayjs().format("YYYY-MM-DD")}.pdf`);
};

export default PdfStockReport;
