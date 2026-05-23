import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const PdfTrialBalanceReport = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string
) => {
  const logo = appConfiguration.logo;
  const reportList = reportData?.report || [];
  const grandTotal = reportData?.grandTotal;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  /* ================= HEADER ================= */
  const addHeader = () => {
    if (logo) {
      doc.addImage(logo, "PNG", pageWidth / 2 - 25, margin, 50, 14);
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Ledger Report", pageWidth / 2, margin + 22, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Period: ${reportType.toUpperCase()}`,
      margin,
      margin + 32
    );
    doc.text(
      `From: ${dayjs(queryParams.fromDate).format("DD MMM YYYY")}`,
      pageWidth / 2 - 30,
      margin + 32
    );
    doc.text(
      `To: ${dayjs(queryParams.toDate).format("DD MMM YYYY")}`,
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

    doc.line(margin, margin + 42, pageWidth - margin, margin + 42);
  };

  addHeader();

  /* ================= TABLE HEADER ================= */
  const head = [
    [
      { content: "Particulars", rowSpan: 2 },
      { content: "Opening Balance", colSpan: 2 },
      { content: "Transaction", colSpan: 2 },
      { content: "Closing", colSpan: 2 },
    ],
    [
      "Debit",
      "Credit",
      "Debit",
      "Credit",
      "Debit",
      "Credit",
    ],
  ];

  /* ================= TABLE BODY ================= */
  const body: any[] = [];

  reportList.forEach((group: any) => {
    /* ===== Group Name ===== */
    body.push([
      {
        content: group.groupName,
        colSpan: 7,
        styles: { fontStyle: "bold", fillColor: [229, 231, 235] },
      },
    ]);

    const groupTotal = {
      openingDebit: 0,
      openingCredit: 0,
      trxDebit: 0,
      trxCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    };

    group.ledger.forEach((ledger: any) => {
      /* ===== Ledger Name ===== */
      body.push([
        {
          content: ledger.ledgerName,
          colSpan: 7,
          styles: { fontStyle: "bold", fillColor: [243, 244, 246] },
        },
      ]);

      if (ledger.particular.length) {
        ledger.particular.forEach((p: any) => {
          body.push([
            { content: `   ${p.particularName ?? "—"}` },
            p.openingDebit.toLocaleString(),
            p.openingCredit.toLocaleString(),
            p.trxDebit.toLocaleString(),
            p.trxCredit.toLocaleString(),
            p.closingDebit.toLocaleString(),
            p.closingCredit.toLocaleString(),
          ]);
        });
      } else {
        body.push([
          {
            content: "   No transactions",
            colSpan: 7,
            styles: { fontStyle: "italic", textColor: [120, 120, 120] },
          },
        ]);
      }

      /* ===== Ledger Subtotal ===== */
      body.push([
        { content: `Sub Total (${currentCurrency?.name})`, styles: { fontStyle: "bold", halign: "right" } },
        ledger.subtotal.openingDebit.toLocaleString(),
        ledger.subtotal.openingCredit.toLocaleString(),
        ledger.subtotal.trxDebit.toLocaleString(),
        ledger.subtotal.trxCredit.toLocaleString(),
        ledger.subtotal.closingDebit.toLocaleString(),
        ledger.subtotal.closingCredit.toLocaleString(),
      ]);

      Object.keys(groupTotal).forEach((key) => {
        groupTotal[key] += ledger.subtotal[key];
      });
    });

    /* ===== Group Total ===== */
    body.push([
      { content: `Total Amount (${currentCurrency?.name})`, styles: { fontStyle: "bold", halign: "right"} },
      groupTotal.openingDebit.toLocaleString(),
      groupTotal.openingCredit.toLocaleString(),
      groupTotal.trxDebit.toLocaleString(),
      groupTotal.trxCredit.toLocaleString(),
      groupTotal.closingDebit.toLocaleString(),
      groupTotal.closingCredit.toLocaleString(),
    ]);
  });

  /* ===== GRAND TOTAL ===== */
  if (grandTotal) {
    body.push([
      {
        content: `Grand Total Amount (${currentCurrency?.name})`,
        styles: { fontStyle: "bold", halign: "right", fillColor: [209, 213, 219] },
      },
      grandTotal.openingDebit.toLocaleString(),
      grandTotal.openingCredit.toLocaleString(),
      grandTotal.trxDebit.toLocaleString(),
      grandTotal.trxCredit.toLocaleString(),
      grandTotal.closingDebit.toLocaleString(),
      grandTotal.closingCredit.toLocaleString(),
    ]);
  }

  /* ================= AUTOTABLE ================= */
  autoTable(doc, {
    startY: margin + 48,
    head,
    body,
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      halign: "right",
    },
    headStyles: {
      halign: "center",
      fontStyle: "bold",
      fillColor: [243, 244, 246],
      textColor: 0,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 70 },
    },
    margin: { left: margin, right: margin },
  });

  /* ================= SIGNATURE ================= */
  const signY = pageHeight - 15;
  const signWidth = (pageWidth - margin * 2) / 4;
  ["Prepared By", "Accounts", "Finance Manager", "Authorized By"].forEach(
    (text, i) => {
      const x = margin + signWidth * i + signWidth / 2;
      doc.text(text, x, signY, { align: "center" });
      doc.line(x - 20, signY + 2, x + 20, signY + 2);
    }
  );

  /* ================= SAVE ================= */
  doc.save(
    `trial-balance-report-${dayjs().format("YYYY-MM-DD")}.pdf`
  );
};

export default PdfTrialBalanceReport;
