import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const PdfLedgerReport = (
  ledgerData: any[],
  currentCurrency: any,
  queryParams: any,
  reportType: string,
 // particularName: string = "All" // ✅ ADD
) => {
  const logo = appConfiguration.logo;

  const doc = new jsPDF("landscape", "mm", "a4"); // ✅ landscape — column বেশি তাই

  //const doc = new jsPDF("portrait", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  if (logo) {
    doc.addImage(logo, "PNG", (pageWidth - 40) / 2, margin, 40, 12);
  }

  doc.setFontSize(16);
  doc.text("LEDGER REPORT", pageWidth / 2, margin + 22, { align: "center" });

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
  // doc.text(
  //   `Particular: ${particularName}`, // ✅ ADD
  //   pageWidth - margin,
  //   margin + 32,
  //   { align: "right" }
  // );
 
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    margin + 38,
    { align: "center" }
  );

  let startY = margin + 45;

  ledgerData.forEach((account: any) => {
    doc.setFontSize(12);
    doc.text(account.accountName, margin, startY);

    startY += 4;

    const body: any[] = [];

    if (account.openingBalance?.balance) {
      body.push([
        dayjs(account.openingBalance.date).format("DD/MM/YYYY"),
        "Balance b/d",
        "",  // ✅ Particular empty
        "",
        "",
        "",
        account.openingBalance.balanceType === "Dr"
          ? `${currentCurrency.name} ${account.openingBalance.balance.toFixed(
              2
            )}`
          : "",
        account.openingBalance.balanceType === "Cr"
          ? `${currentCurrency.name} ${account.openingBalance.balance.toFixed(
              2
            )}`
          : "",
      ]);
    }

    account.transactions.forEach((trx: any) => {
      body.push([
        dayjs(trx.date).format("DD/MM/YYYY"),
        trx.description,
        trx.oppositeAccount ?? "-", // ✅ Particular
        trx.voucherNo,
        trx.debit
          ? `${currentCurrency.name} ${trx.debit.toFixed(2)}`
          : "",
        trx.credit
          ? `${currentCurrency.name} ${trx.credit.toFixed(2)}`
          : "",
        trx.balanceType === "Dr"
          ? `${currentCurrency.name} ${trx.balance.toFixed(2)}`
          : "",
        trx.balanceType === "Cr"
          ? `${currentCurrency.name} ${trx.balance.toFixed(2)}`
          : "",
      ]);
    });

    body.push([
      dayjs(account.summary.closingBalance.date).format("DD/MM/YYYY"),
      "Balance c/d",
      "",// ✅ Particular empty
      "",
      "",
      "",
      account.summary.closingBalance.balanceType === "Dr"
        ? `${currentCurrency.name} ${account.summary.closingBalance.balance.toFixed(
            2
          )}`
        : "",
      account.summary.closingBalance.balanceType === "Cr"
        ? `${currentCurrency.name} ${account.summary.closingBalance.balance.toFixed(
            2
          )}`
        : "",
    ]);

    autoTable(doc, {
      startY,
      head: [
        [
          "Date",
          "Description",
           "Particular",   // ✅ ADD
          "V.N/J.N",
          "Debit",
          "Credit",
          "Balance Dr",
          "Balance Cr",
        ],
      ],
      body,
      theme: "grid",
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
  });

  doc.save(`ledger-report-${dayjs().format("YYYY-MM-DD")}.pdf`);
};

export default PdfLedgerReport;