import { appConfiguration } from "@/utils/constant/appConfiguration";
import { formatDate } from "date-fns";

const TrialBalanceReportPrint = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string
) => {
  const logo = appConfiguration.logo;
  const reportList = reportData?.report || [];
  const grandTotal = reportData?.grandTotal;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Ledger Report</title>
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
      thead {
        display: table-header-group;
      }
      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>

<body class="text-sm">
  <div class="max-w-7xl mx-auto p-6 space-y-6">

    <!-- ================= HEADER ================= -->
    <div class="text-center border-b pb-4">
      <img src="${logo}" class="mx-auto h-14 mb-3" />
      <h1 class="text-2xl font-bold uppercase">Ledger Report</h1>

      <div class="flex justify-center gap-6 mt-2 text-sm">
        <p><b>Period:</b> ${reportType}</p>
        <p><b>From:</b> ${formatDate(
          queryParams.fromDate,
          "dd MMM yyyy"
        )}</p>
        <p><b>To:</b> ${formatDate(queryParams.toDate, "dd MMM yyyy")}</p>
      </div>

      <p class="text-xs text-gray-500 mt-1">
        Generated on: ${new Date().toLocaleString()}
      </p>
    </div>

    <!-- ================= TABLE ================= -->
    <table class="w-full border-collapse border text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th rowspan="2" class="border px-3 py-2 text-left">Particulars</th>
          <th colspan="2" class="border px-3 py-2 text-center">Opening Balance</th>
          <th colspan="2" class="border px-3 py-2 text-center">Transaction</th>
          <th colspan="2" class="border px-3 py-2 text-center">Closing</th>
        </tr>
        <tr>
          <th class="border px-2 py-2 text-right">Debit (${currentCurrency.name})</th>
          <th class="border px-2 py-2 text-right">Credit (${currentCurrency.name})</th>
          <th class="border px-2 py-2 text-right">Debit (${currentCurrency.name})</th>
          <th class="border px-2 py-2 text-right">Credit (${currentCurrency.name})</th>
          <th class="border px-2 py-2 text-right">Debit (${currentCurrency.name})</th>
          <th class="border px-2 py-2 text-right">Credit (${currentCurrency.name})</th>
        </tr>
      </thead>

      <tbody>
        ${
          reportList.length
            ? reportList
                .map((group: any) => {
                  const groupTotal = group.ledger.reduce(
                    (acc: any, l: any) => {
                      acc.openingDebit += l.subtotal.openingDebit;
                      acc.openingCredit += l.subtotal.openingCredit;
                      acc.trxDebit += l.subtotal.trxDebit;
                      acc.trxCredit += l.subtotal.trxCredit;
                      acc.closingDebit += l.subtotal.closingDebit;
                      acc.closingCredit += l.subtotal.closingCredit;
                      return acc;
                    },
                    {
                      openingDebit: 0,
                      openingCredit: 0,
                      trxDebit: 0,
                      trxCredit: 0,
                      closingDebit: 0,
                      closingCredit: 0,
                    }
                  );

                  return `
                  <!-- ===== GROUP ===== -->
                  <tr class="bg-gray-200 font-bold">
                    <td colspan="7" class="border px-4 py-2">
                      ${group.groupName}
                    </td>
                  </tr>

                  ${group.ledger
                    .map(
                      (ledger: any) => `
                    <!-- ===== LEDGER ===== -->
                    <tr class="bg-gray-50 font-semibold">
                      <td colspan="7" class="border px-6 py-2">
                        ${ledger.ledgerName}
                      </td>
                    </tr>

                    ${
                      ledger.particular.length
                        ? ledger.particular
                            .map(
                              (p: any) => `
                          <tr>
                            <td class="border px-10 py-2">${p.particularName ?? "—"}</td>
                            <td class="border px-2 py-2 text-right">${p.openingDebit.toLocaleString()}</td>
                            <td class="border px-2 py-2 text-right">${p.openingCredit.toLocaleString()}</td>
                            <td class="border px-2 py-2 text-right">${p.trxDebit.toLocaleString()}</td>
                            <td class="border px-2 py-2 text-right">${p.trxCredit.toLocaleString()}</td>
                            <td class="border px-2 py-2 text-right">${p.closingDebit.toLocaleString()}</td>
                            <td class="border px-2 py-2 text-right">${p.closingCredit.toLocaleString()}</td>
                          </tr>
                        `
                            )
                            .join("")
                        : `
                          <tr>
                            <td class="border px-10 py-2 italic text-gray-500">
                              No transactions
                            </td>
                            <td colspan="6" class="border"></td>
                          </tr>
                        `
                    }

                    <!-- ===== LEDGER SUBTOTAL ===== -->
                    <tr class="font-semibold">
                      <td class="border px-6 py-2 text-right">Sub Total (${currentCurrency.name.toLocaleString()})</td>
                      <td class="border px-2 py-2 text-right">${ledger.subtotal.openingDebit.toLocaleString()}</td>
                      <td class="border px-2 py-2 text-right">${ledger.subtotal.openingCredit.toLocaleString()}</td>
                      <td class="border px-2 py-2 text-right">${ledger.subtotal.trxDebit.toLocaleString()}</td>
                      <td class="border px-2 py-2 text-right">${ledger.subtotal.trxCredit.toLocaleString()}</td>
                      <td class="border px-2 py-2 text-right">${ledger.subtotal.closingDebit.toLocaleString()}</td>
                      <td class="border px-2 py-2 text-right">${ledger.subtotal.closingCredit.toLocaleString()}</td>
                    </tr>
                  `
                    )
                    .join("")}

                  <!-- ===== GROUP TOTAL ===== -->
                  <tr class="bg-gray-100 font-bold">
                    <td class="border px-4 py-2 text-right">Total Amount (${currentCurrency.name.toLocaleString()})</td>
                    <td class="border px-2 py-2 text-right">${groupTotal.openingDebit.toLocaleString()}</td>
                    <td class="border px-2 py-2 text-right">${groupTotal.openingCredit.toLocaleString()}</td>
                    <td class="border px-2 py-2 text-right">${groupTotal.trxDebit.toLocaleString()}</td>
                    <td class="border px-2 py-2 text-right">${groupTotal.trxCredit.toLocaleString()}</td>
                    <td class="border px-2 py-2 text-right">${groupTotal.closingDebit.toLocaleString()}</td>
                    <td class="border px-2 py-2 text-right">${groupTotal.closingCredit.toLocaleString()}</td>
                  </tr>
                `;
                })
                .join("")
            : `
              <tr>
                <td colspan="7" class="border p-6 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            `
        }

        <!-- ================= GRAND TOTAL ================= -->
        ${
          grandTotal
            ? `
          <tr class="bg-gray-300 font-bold">
            <td class="border px-4 py-3 text-right">Grand Total (${currentCurrency.name.toLocaleString()})</td>
            <td class="border px-2 py-3 text-right">${grandTotal.openingDebit.toLocaleString()}</td>
            <td class="border px-2 py-3 text-right">${grandTotal.openingCredit.toLocaleString()}</td>
            <td class="border px-2 py-3 text-right">${grandTotal.trxDebit.toLocaleString()}</td>
            <td class="border px-2 py-3 text-right">${grandTotal.trxCredit.toLocaleString()}</td>
            <td class="border px-2 py-3 text-right">${grandTotal.closingDebit.toLocaleString()}</td>
            <td class="border px-2 py-3 text-right">${grandTotal.closingCredit.toLocaleString()}</td>
          </tr>
        `
            : ""
        }
      </tbody>
    </table>
  </div>
</body>
</html>
`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  }
};

export default TrialBalanceReportPrint;
