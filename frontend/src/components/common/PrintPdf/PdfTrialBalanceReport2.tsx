import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const PdfTrialBalanceReport2 = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string
) => {
  const logo = appConfiguration.logo;

  const doc = new jsPDF("portrait", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  if (logo) {
    doc.addImage(logo, "PNG", (pageWidth - 40) / 2, margin, 40, 12);
  }

  doc.setFontSize(16);
  doc.text("TRIAL BALANCE REPORT", pageWidth / 2, margin + 22, {
    align: "center",
  });

  doc.setFontSize(10);

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

  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    margin + 38,
    { align: "center" }
  );

  let sl = 1;

  const body: any[] = [];

  body.push([
    { content: "Opening Balance", colSpan: 5, styles: { fontStyle: "bold" } },
  ]);

  body.push([
    sl++,
    "Last Month Cash In Hand",
    "",
    `${currentCurrency.name} ${reportData.openingBalance.toFixed(2)}`,
    "",
  ]);

  body.push([
    { content: "Inflows (Debit Items)", colSpan: 5, styles: { fontStyle: "bold" } },
  ]);

  reportData.inflows.forEach((item: any) => {
    body.push([
      sl++,
      item.accountDescription,
      item.ledgerNo,
      `${currentCurrency.name} ${item.debit.toFixed(2)}`,
      item.credit ? `${currentCurrency.name} ${item.credit.toFixed(2)}` : "",
    ]);
  });

  body.push([
    { content: "Outflows (Credit Items)", colSpan: 5, styles: { fontStyle: "bold" } },
  ]);

  reportData.outflows.forEach((item: any) => {
    body.push([
      sl++,
      item.accountDescription,
      item.ledgerNo,
      item.debit ? `${currentCurrency.name} ${item.debit.toFixed(2)}` : "",
      `${currentCurrency.name} ${item.credit.toFixed(2)}`,
    ]);
  });

  body.push([
    { content: "Closing Balance", colSpan: 5, styles: { fontStyle: "bold" } },
  ]);

  body.push([
    sl++,
    "This Month Cash In Hand",
    "",
    `${currentCurrency.name} ${reportData.closingBalance.toFixed(2)}`,
    "",
  ]);

  body.push([
    "",
    "Total",
    "",
    `${currentCurrency.name} ${reportData.totals.debit.toFixed(2)}`,
    `${currentCurrency.name} ${reportData.totals.credit.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: margin + 45,
    head: [
      [
        "SL",
        "Account Description",
        "Ledger No",
        "Debit",
        "Credit",
      ],
    ],
    body,
    theme: "grid",
    styles: {
      fontSize: 8,
    },
  });

  doc.save(`trial-balance-${dayjs().format("YYYY-MM-DD")}.pdf`);
};

export default PdfTrialBalanceReport2;