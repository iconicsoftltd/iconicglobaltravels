import { appConfiguration } from "@/utils/constant/appConfiguration";
import { format } from "date-fns";

const ProfitLossReportPrint = (
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
        <title>Profit & Loss Report</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .signature-section {
              position: absolute;
              bottom: 20px;
              left: 0;
              right: 0;
              padding: 0 24px;
            }
          }
        </style>
      </head>

      <body class="font-sans text-gray-900 p-6">
        <div class="max-w-5xl mx-auto space-y-6">

          <!-- Header -->
          <div class="text-center mb-6 border-b border-gray-300 pb-4">
            <img src="${logo}" class="mx-auto h-14 mb-3" />
            <h1 class="text-2xl font-bold uppercase tracking-wide">Profit & Loss Report</h1>
            <div class="flex justify-center gap-8 mt-2 text-sm">
              <p><span class="font-semibold">Period:</span> ${reportType}</p>
              <p><span class="font-semibold">From:</span> ${queryParams.fromDate ? format(new Date(queryParams.fromDate), "dd MMM yyyy") : "-"}</p>
              <p><span class="font-semibold">To:</span> ${queryParams.toDate ? format(new Date(queryParams.toDate), "dd MMM yyyy") : "-"}</p>
            </div>
            <p class="text-sm text-gray-600 mt-1">Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <!-- Custom Table -->
          <table class="w-full border-collapse border border-gray-300 text-sm">
            <tbody>
              ${
                report
                  ? Object.entries(report)
                      .map(
                        ([key, value]: [string, any]) => `
                <tr>
                  <td class="border border-gray-300 p-2 font-medium capitalize">
                    ${key.split(/(?=[A-Z])|_/).join(" ")}
                  </td>
                  <td class="border border-gray-300 p-2 font-semibold text-right">
                    (${currentCurrency.name}) ${typeof value === "number" ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
                  </td>
                </tr>
              `
                      )
                      .join("")
                  : `<tr><td colspan="2" class="p-4 text-center text-gray-500">No data available</td></tr>`
              }
            </tbody>
          </table>

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

export default ProfitLossReportPrint;
