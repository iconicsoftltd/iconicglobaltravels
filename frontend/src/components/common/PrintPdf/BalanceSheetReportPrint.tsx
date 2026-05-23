import { appConfiguration } from "@/utils/constant/appConfiguration";
import { format } from "date-fns";

const BalanceSheetReportPrint = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string
) => {
  const logo = appConfiguration.logo;
  const report = reportData?.data;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Balance Sheet Report</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; color-adjust: exact; }
            .page-break { page-break-after: always; }
            .no-break { page-break-inside: avoid; }
            .signature-section {
              position: absolute;
              bottom: 20px;
              left: 0;
              right: 0;
              padding: 0 24px;
            }
            .content-container {
              min-height: calc(100vh - 100px);
            }
          }
        </style>
      </head>
      <body class="font-sans text-gray-900 p-6">
        <div class="max-w-6xl mx-auto space-y-6 no-break content-container">
          <div class="p-6">

            <!-- Header -->
            <div class="text-center mb-6 border-b border-gray-300 pb-4">
              <img src="${logo}" alt="Logo" class="mx-auto h-14 mb-3" />
              <h1 class="text-2xl font-bold uppercase tracking-wide">Balance Sheet Report</h1>
              <div class="flex justify-center gap-8 mt-2 text-sm">
                <p><span class="font-semibold">Period:</span> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                <p><span class="font-semibold">From:</span> ${queryParams.fromDate ? format(new Date(queryParams.fromDate), "dd MMM yyyy") : "-"}</p>
                <p><span class="font-semibold">To:</span> ${queryParams.toDate ? format(new Date(queryParams.toDate), "dd MMM yyyy") : "-"}</p>
              </div>
              <p class="text-sm text-gray-600 mt-1">Generated on: ${new Date().toLocaleString()}</p>
            </div>

            <!-- Report Table -->
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="border border-gray-300 p-2 text-center font-semibold">Account</th>
                  <th class="border border-gray-300 p-2 text-center font-semibold">Classification</th>
                  <th class="border border-gray-300 p-2 text-center font-semibold">Amount</th>
                  <th class="border border-gray-300 p-2 text-center font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <!-- ===== Assets Section ===== -->
                ${
                  report?.assets
                    ?.map(
                      (group: any) => `
                  <tr class="bg-gray-50 font-semibold">
                    <td class="p-2 text-lg border border-gray-300">${group.groupName}</td>
                    <td class="p-2 border border-gray-300"></td>
                    <td class="p-2 border border-gray-300"></td>
                    <td class="p-2 border border-gray-300"></td>
                  </tr>
                  ${
                    group.account
                      ?.map(
                        (item: any, j: number) => `
                    <tr class="${j % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                      <td class="border border-gray-300 p-2">${item.account || "-"}</td>
                      <td class="border border-gray-300 p-2">${item.classification || "-"}</td>
                      <td class="border border-gray-300 p-2 text-right">(${currentCurrency.name}) ${item.amount?.toFixed(2) || "0.00"}</td>
                      <td class="border border-gray-300 p-2 text-right"></td>
                    </tr>
                  `
                      )
                      .join("") || '<tr><td colspan="4" class="border border-gray-300 p-2 text-center text-gray-500">No accounts</td></tr>'
                  }
                  <tr class="font-semibold bg-gray-100">
                    <td class="border border-gray-300 p-2">Total ${group.groupName}</td>
                    <td class="border border-gray-300 p-2"></td>
                    <td class="border border-gray-300 p-2 text-right"></td>
                    <td class="border border-gray-300 p-2 text-right font-bold">(${currentCurrency.name}) ${group.totalAmount?.toFixed(2) || "0.00"}</td>
                  </tr>
                  <tr><td colspan="4" class="p-2 bg-white"></td></tr>
                `).join("") || '<tr><td colspan="4" class="border border-gray-300 p-2 text-center text-gray-500">No assets data</td></tr>'
                }

                <tr class="font-bold bg-gray-200">
                  <td class="border border-gray-300 p-2 text-lg">TOTAL ASSETS</td>
                  <td class="border border-gray-300 p-2"></td>
                  <td class="border border-gray-300 p-2 text-right"></td>
                  <td class="border border-gray-300 p-2 text-right font-bold text-lg">(${currentCurrency.name}) ${report?.totalAssets?.toFixed(2) || "0.00"}</td>
                </tr>

                <tr><td colspan="4" class="p-4 bg-white"></td></tr>

                <!-- ===== Liabilities Section ===== -->
                ${
                  report?.liabilities
                    ?.map(
                      (group: any) => `
                  <tr class="bg-gray-50 font-semibold">
                    <td class="p-2 text-lg border border-gray-300">${group.groupName}</td>
                    <td class="p-2 border border-gray-300"></td>
                    <td class="p-2 border border-gray-300"></td>
                    <td class="p-2 border border-gray-300"></td>
                  </tr>
                  ${
                    group.account
                      ?.map(
                        (item: any, j: number) => `
                    <tr class="${j % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                      <td class="border border-gray-300 p-2">${item.account || "-"}</td>
                      <td class="border border-gray-300 p-2">${item.classification || "-"}</td>
                      <td class="border border-gray-300 p-2 text-right">(${currentCurrency.name}) ${item.amount?.toFixed(2) || "0.00"}</td>
                      <td class="border border-gray-300 p-2 text-right"></td>
                    </tr>
                  `
                      )
                      .join("") || '<tr><td colspan="4" class="border border-gray-300 p-2 text-center text-gray-500">No accounts</td></tr>'
                  }
                  <tr class="font-semibold bg-gray-100">
                    <td class="border border-gray-300 p-2">Total ${group.groupName}</td>
                    <td class="border border-gray-300 p-2"></td>
                    <td class="border border-gray-300 p-2 text-right"></td>
                    <td class="border border-gray-300 p-2 text-right font-bold">(${currentCurrency.name}) ${group.totalAmount?.toFixed(2) || "0.00"}</td>
                  </tr>
                  <tr><td colspan="4" class="p-2 bg-white"></td></tr>
                `).join("") || '<tr><td colspan="4" class="border border-gray-300 p-2 text-center text-gray-500">No liabilities data</td></tr>'
                }

                <!-- ===== Owner's Equity ===== -->
                <tr class="font-semibold bg-gray-50">
                  <td class="p-2 text-lg border border-gray-300">Owner's Equity</td>
                  <td class="border border-gray-300 p-2"></td>
                  <td class="border border-gray-300 p-2"></td>
                  <td class="border border-gray-300 p-2 text-right font-bold">(${currentCurrency.name}) ${report?.ownerSecurity?.toFixed(2) || "0.00"}</td>
                </tr>

                <tr class="font-bold bg-gray-200">
                  <td class="border border-gray-300 p-2 text-lg">TOTAL LIABILITIES & EQUITY</td>
                  <td class="border border-gray-300 p-2"></td>
                  <td class="border border-gray-300 p-2 text-right"></td>
                  <td class="border border-gray-300 p-2 text-right font-bold text-lg">(${currentCurrency.name}) ${report?.totalLiabilitiesAndEquity?.toFixed(2) || "0.00"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer Signatures -->
          <div class="flex justify-between text-sm signature-section">
            <p class="font-semibold underline">General Manager</p>
            <p class="font-semibold underline">Finance Manager</p>
            <p class="font-semibold underline">Accounts Officer</p>
            <p class="font-semibold underline">Prepared By</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
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

export default BalanceSheetReportPrint;
