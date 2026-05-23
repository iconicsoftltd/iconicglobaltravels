import { appConfiguration } from "@/utils/constant/appConfiguration";

const IncomeStatementReportPrint = (reportData: any, currentCurrency: any, queryParams: any, reportType: string) => {
  const logo = appConfiguration.logo;
  const report = reportData?.data;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Income Statement Report</title>
        <script>
          function loadTailwind(callback) {
            const s = document.createElement('script');
            s.src = 'https://cdn.tailwindcss.com';
            s.onload = callback;
            document.head.appendChild(s);
          }
          window.onload = () => {
            loadTailwind(() => {
              document.body.classList.add('font-sans', 'text-gray-900', 'p-6');
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 300);
            });
          };
        </script>
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
      <body>
        <div class="max-w-6xl mx-auto space-y-6 no-break">
          <div class="p-6">
            <!-- Header -->
            <div class="text-center mb-6 border-b border-gray-300 pb-4">
              <img src="${logo}" alt="Logo" class="mx-auto h-14 mb-3" />
              <h1 class="text-2xl font-bold uppercase tracking-wide">Income Statement Report</h1>
              <div class="flex justify-center gap-8 mt-2 text-sm">
                <p><span class="font-semibold">Period:</span> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                <p><span class="font-semibold">From:</span> ${queryParams.fromDate}</p>
                <p><span class="font-semibold">To:</span> ${queryParams.toDate}</p>
              </div>
              <p class="text-sm text-gray-600 mt-1">Generated on: ${new Date().toLocaleString()}</p>
            </div>

            <!-- Report Table -->
            <table class="w-full border-collapse border border-gray-300 text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="border border-gray-300 p-2 text-center font-semibold">
                    Account
                  </th>
                  <th class="border border-gray-300 p-2 text-center font-semibold">
                    Classification
                  </th>
                  <th class="border border-gray-300 p-2 text-center font-semibold">
                    Amount
                  </th>
                  <th class="border border-gray-300 p-2 text-center font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                <!-- Revenue Section -->
                <tr class="bg-gray-50 font-semibold">
                  <td class="p-2 text-lg border border-gray-300">REVENUE</td>
                  <td class="p-2 border border-gray-300"></td>
                  <td class="p-2 border border-gray-300"></td>
                  <td class="p-2 border border-gray-300"></td>
                </tr>

                ${report?.revenue?.map((item: any, i: number) => `
                  <tr key="rev-${i}" class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                    <td class="border border-gray-300 p-2">${item.account || '-'}</td>
                    <td class="border border-gray-300 p-2">${item.classification || '-'}</td>
                    <td class="border border-gray-300 p-2 text-right">(${currentCurrency.name}) ${item.amount?.toFixed(2) || '0.00'}</td>
                    <td class="border border-gray-300 p-2 text-right"></td>
                  </tr>
                `).join('') || '<tr><td colspan="4" class="border border-gray-300 p-2 text-center text-gray-500">No revenue data</td></tr>'}

                <tr class="font-semibold bg-gray-100">
                  <td class="border border-gray-300 p-2 font-bold text-xl">Total Revenue</td>
                  <td class="border border-gray-300 p-2"></td>
                  <td class="border border-gray-300 p-2 text-right"></td>
                  <td class="border border-gray-300 p-2 text-right font-bold">
                    (${currentCurrency.name}) ${report?.totalRevenue?.toFixed(2) || '0.00'}
                  </td>
                </tr>

                <tr>
                  <td colspan="4" class="p-2 bg-white"></td>
                </tr>

                <!-- Expenses Section -->
                <tr class="bg-gray-50 font-semibold">
                  <td class="text-lg p-2 border border-gray-300">EXPENSES</td>
                  <td class="p-2 border border-gray-300"></td>
                  <td class="p-2 border border-gray-300"></td>
                  <td class="p-2 border border-gray-300"></td>
                </tr>

                ${report?.expense?.map((item: any, i: number) => `
                  <tr key="exp-${i}" class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                    <td class="border border-gray-300 p-2">${item.account || '-'}</td>
                    <td class="border border-gray-300 p-2">${item.classification || '-'}</td>
                    <td class="border border-gray-300 p-2 text-right">(${currentCurrency.name}) ${item.amount?.toFixed(2) || '0.00'}</td>
                    <td class="border border-gray-300 p-2 text-right"></td>
                  </tr>
                `).join('') || '<tr><td colspan="4" class="border border-gray-300 p-2 text-center text-gray-500">No expense data</td></tr>'}

                <tr class="font-semibold bg-gray-100">
                  <td class="border border-gray-300 p-2 text-xl font-bold">Total Expenses</td>
                  <td class="border border-gray-300 p-2"></td>
                  <td class="border border-gray-300 p-2 text-right"></td>
                  <td class="border border-gray-300 p-2 text-right font-bold">
                    (${currentCurrency.name}) ${report?.totalExpense?.toFixed(2) || '0.00'}
                  </td>
                </tr>

                <tr>
                  <td colspan="4" class="p-2 bg-white"></td>
                </tr>

                <!-- Net Income -->
                <tr class="font-bold ${report?.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}">
                  <td class="border border-gray-300 p-2 text-lg">
                    NET INCOME ${report?.netIncome >= 0 ? '(PROFIT)' : '(LOSS)'}
                  </td>
                  <td class="border border-gray-300 p-2"></td>
                  <td class="border border-gray-300 p-2 text-right"></td>
                  <td class="border border-gray-300 p-2 text-right text-lg">
                    (${currentCurrency.name}) ${report?.netIncome?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>

            </div>
            </div>
            <!-- Footer Signatures -->
            <div class="flex justify-between text-sm signature-section">
              <p class="font-semibold underline">General Manager</p>
              <p class="font-semibold underline">Finance Manager</p>
              <p class="font-semibold underline">Accounts Officer</p>
              <p class="font-semibold underline">Prepared By</p>
            </div>
      </body>
    </html>
  `;

  const width = 1000;
  const height = 800;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const printWindow = window.open(
    "",
    "_blank",
    `width=${width},height=${height},top=${top},left=${left}`
  );

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

export default IncomeStatementReportPrint;