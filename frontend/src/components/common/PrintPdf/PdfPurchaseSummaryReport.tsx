import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const PdfPurchaseSummaryReport = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string
) => {
  const logo = appConfiguration.logo;
  const report = reportData?.data;

  const doc = new jsPDF("portrait", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  /* Header */
  if (logo) {
    doc.addImage(logo, "PNG", (pageWidth - 40) / 2, margin, 40, 12);
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Purchase Summary", pageWidth / 2, margin + 22, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${reportType}`, margin, margin + 32);
  doc.text(`From: ${queryParams.fromDate}`, pageWidth / 2 - 20, margin + 32);
  doc.text(`To: ${queryParams.toDate}`, pageWidth - margin, margin + 32, {
    align: "right",
  });

  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    margin + 38,
    { align: "center" }
  );

  /* Table Body */
  const body =
    report?.rows?.map((row: any, index: number) => [
      index + 1,
      row.description || "-",
      {
        content: `${currentCurrency.name} ${row.valueExcl?.toFixed(2) || "0.00"}`,
        styles: { halign: "right" },
      },
      {
        content: `${currentCurrency.name} ${row.vatPaid?.toFixed(2) || "0.00"}`,
        styles: { halign: "right" },
      },
      {
        content: row.reclaimable || "-",
        styles: { halign: "center" },
      },
    ]) || [];

  /* Totals Row */
  body.push([
    {
      content: "Total",
      colSpan: 2,
      styles: { fontStyle: "bold", halign: "right" },
    },
    {
      content: `${currentCurrency.name} ${report?.totals?.totalValueExcl?.toFixed(2) || "0.00"}`,
      styles: { fontStyle: "bold", halign: "right" },
    },
    {
      content: `${currentCurrency.name} ${report?.totals?.totalVatPaid?.toFixed(2) || "0.00"}`,
      styles: { fontStyle: "bold", halign: "right" },
    },
    "",
  ]);

  autoTable(doc, {
    startY: margin + 45,
    head: [[
      "SL",
      "Description",
      "Value (Excl.)",
      "VAT Paid",
      "Reclaimable?",
    ]],
    body,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
    margin: { left: margin, right: margin },
  });

  doc.save(`purchase-summary-${dayjs().format("YYYY-MM-DD")}.pdf`);
};

export default PdfPurchaseSummaryReport;