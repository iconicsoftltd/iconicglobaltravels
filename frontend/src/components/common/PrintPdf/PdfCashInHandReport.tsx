import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const PdfCashInHandReport = (
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

  /* ================= Header ================= */
  if (logo) {
    doc.addImage(logo, "PNG", (pageWidth - 40) / 2, margin, 40, 12);
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CASH IN HAND REPORT", pageWidth / 2, margin + 22, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Period: ${reportType}`, margin, margin + 32);
  doc.text(
    `From: ${
      queryParams?.fromDate
        ? dayjs(queryParams.fromDate).format("DD MMM YYYY")
        : "-"
    }`,
    pageWidth / 2 - 20,
    margin + 32
  );
  doc.text(
    `To: ${
      queryParams?.toDate
        ? dayjs(queryParams.toDate).format("DD MMM YYYY")
        : "-"
    }`,
    pageWidth - margin,
    margin + 32,
    { align: "right" }
  );

  doc.setFontSize(9);
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    margin + 38,
    { align: "center" }
  );

  /* ================= Table Body ================= */
  const body =
    report?.rows?.map((row: any, index: number) => [
      index + 1,
      dayjs(row.date).format("DD/MM/YYYY"),
      row.description || "-",
      row.voucherNo || "-",
      {
        content: row.debit
          ? `${currentCurrency.name} ${Number(row.debit).toFixed(2)}`
          : "-",
        styles: { halign: "right" },
      },
      {
        content: row.credit
          ? `${currentCurrency.name} ${Number(row.credit).toFixed(2)}`
          : "-",
        styles: { halign: "right" },
      },
      {
        content: row.balanceDebit
          ? `${currentCurrency.name} ${Number(row.balanceDebit).toFixed(2)}`
          : "-",
        styles: { halign: "right" },
      },
      {
        content: row.balanceCredit
          ? `${currentCurrency.name} ${Number(row.balanceCredit).toFixed(2)}`
          : "-",
        styles: { halign: "right" },
      },
    ]) || [];

  /* ================= Balance c/d ================= */
  body.push([
    "",
    "",
    {
      content: "Balance c/d",
      styles: { fontStyle: "bold" },
    },
    "",
    "",
    "",
    {
      content: `${currentCurrency.name} ${
        report?.summary?.totalBalanceDebit?.toFixed(2) || "0.00"
      }`,
      styles: {
        fontStyle: "bold",
        halign: "right",
      },
    },
    "",
  ]);

  autoTable(doc, {
    startY: margin + 45,
    head: [[
      "SL",
      "Date",
      "Description",
      "V.N./J.N.",
      "Debit",
      "Credit",
      "Balance (Dr)",
      "Balance (Cr)",
    ]],
    body,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    didParseCell: function (data) {
      // Balance c/d row background
      if (data.row.index === body.length - 1) {
        data.cell.styles.fillColor = [243, 244, 246];
      }
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 20 },
      2: { cellWidth: 40 },
      3: { cellWidth: 20 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22 },
      7: { cellWidth: 22 },
    },
    margin: { left: margin, right: margin },
  });

  doc.save(`cash-in-hand-report-${dayjs().format("YYYY-MM-DD")}.pdf`);
};

export default PdfCashInHandReport;