import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const PdfGeneralLedgerReport = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string
) => {
  const logo = appConfiguration.logo;
  const report = reportData?.data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Header
  const addHeader = () => {
    const logoWidth = 50;
    const logoHeight = 15;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = margin;

    if (logo) doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);

    const titleY = logoY + logoHeight + 8;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Voucher Ledger Report", pageWidth / 2, titleY, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Period: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
      margin,
      titleY + 12
    );
    doc.text(`From: ${queryParams.fromDate}`, pageWidth / 2 - 20, titleY + 12);
    doc.text(`To: ${queryParams.toDate}`, pageWidth - margin, titleY + 12, {
      align: "right",
    });

    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      titleY + 18,
      { align: "center" }
    );

    doc.setLineWidth(0.5);
    doc.line(margin, titleY + 22, pageWidth - margin, titleY + 22);
  };

  addHeader();

  // Prepare table body
  const tableBody =
    report?.rows?.map((row: any) => [
      dayjs(row.date).format("DD-MM-YYYY"),
      row.details || "-",
      row.narration || "-",
      {
        content: `${currentCurrency.name} ${row.debit?.toFixed(2) || "0.00"}`,
        styles: { halign: "right" },
      },
      {
        content: `${currentCurrency.name} ${row.credit?.toFixed(2) || "0.00"}`,
        styles: { halign: "right" },
      },
    ]) || [];

  // Add totals row
  tableBody.push([
    {
      content: "Total:",
      colSpan: 3,
      styles: { fontStyle: "bold", halign: "right" },
    },
    {
      content: `${currentCurrency.name} ${
        report?.totals?.totalDebit?.toFixed(2) || "0.00"
      }`,
      styles: { fontStyle: "bold", halign: "right" },
    },
    {
      content: `${currentCurrency.name} ${
        report?.totals?.totalCredit?.toFixed(2) || "0.00"
      }`,
      styles: { fontStyle: "bold", halign: "right" },
    },
  ]);

  // Add Balance row (like your UI)
  tableBody.push([
    {
      content: "Balance",
      colSpan: 4,
      styles: { fontStyle: "bold", halign: "right" },
    },
    {
      content: `(${currentCurrency.name}) ${
        report?.balance?.toFixed(2) || "0.00"
      }`,
      styles: { fontStyle: "bold", halign: "right" },
    },
  ]);

  // Generate table
  autoTable(doc, {
    startY: margin + 45,
    head: [
      [
        {
          content: "Date",
          styles: { fontStyle: "bold", fillColor: [243, 244, 246] },
        },

        {
          content: "Details",
          styles: { fontStyle: "bold", fillColor: [243, 244, 246] },
        },
        {
          content: "Narration",
          styles: { fontStyle: "bold", fillColor: [243, 244, 246] },
        },
        {
          content: "Debit",
          styles: {
            fontStyle: "bold",
            fillColor: [243, 244, 246],
            halign: "right",
          },
        },
        {
          content: "Credit",
          styles: {
            fontStyle: "bold",
            fillColor: [243, 244, 246],
            halign: "right",
          },
        },
      ],
    ],
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [209, 213, 219],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 70 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
    },
    margin: { left: margin, right: margin },
  });

  // Add signature section
  const signaturesY = pageHeight - 25;
  const signatureWidth = (pageWidth - 2 * margin) / 4;
  const signatures = [
    "Prepared By",
    "Accounts Officer",
    "Finance Manager",
    "General Manager",
  ];

  signatures.forEach((signature, index) => {
    const x = margin + index * signatureWidth + signatureWidth / 2;
    doc.text(signature, x, signaturesY, { align: "center" });
    doc.line(x - 20, signaturesY + 2, x + 20, signaturesY + 2);
  });

  // Save PDF
  const fileName = `voucher-ledger-report-${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

export default PdfGeneralLedgerReport;
