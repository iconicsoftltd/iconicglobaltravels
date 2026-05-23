import { appConfiguration } from "@/utils/constant/appConfiguration";
import { format } from "date-fns";

const SalesSummaryReportPrint = (
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
  <title>Sales Summary Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  </style>
</head>

<body class="p-6 text-gray-900 font-sans">
  <div class="max-w-5xl mx-auto space-y-6">

    <!-- Header -->
    <div class="text-center border-b pb-4">
      <img src="${logo}" class="mx-auto h-14 mb-2" />
      <h1 class="text-2xl font-bold uppercase">Sales Summary (Output Tax)</h1>
      <div class="flex justify-center gap-6 text-sm mt-2">
        <p><b>Period:</b> ${reportType}</p>
        <p><b>From:</b> ${queryParams.fromDate ? format(new Date(queryParams.fromDate), "dd MMM yyyy") : "-"}</p>
        <p><b>To:</b> ${queryParams.toDate ? format(new Date(queryParams.toDate), "dd MMM yyyy") : "-"}</p>
      </div>
      <p class="text-sm text-gray-600 mt-1">
        Generated on: ${new Date().toLocaleString()}
      </p>
    </div>

    <!-- Table -->
    <table class="w-full border border-gray-300 border-collapse text-sm">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">SL</th>
          <th class="border p-2">Description</th>
          <th class="border p-2 text-right">Value (Excl.)</th>
          <th class="border p-2 text-right">VAT Rate</th>
          <th class="border p-2 text-right">VAT Amount</th>
          <th class="border p-2 text-right">SD</th>
        </tr>
      </thead>

      <tbody>
        ${
          report?.rows?.length
            ? report.rows
                .map(
                  (row: any, index: number) => `
          <tr>
            <td class="border p-2 text-center">${index + 1}</td>
            <td class="border p-2">${row.description || "-"}</td>
            <td class="border p-2 text-right">${row.valueExcl?.toFixed(2) || "0.00"}</td>
            <td class="border p-2 text-right">${row.vatRate || 0}</td>
            <td class="border p-2 text-right">${row.vatAmount?.toFixed(2) || "0.00"}</td>
            <td class="border p-2 text-right">${row.sd?.toFixed(2) || "0.00"}</td>
          </tr>
        `
                )
                .join("")
            : `<tr>
                <td colspan="6" class="text-center p-4 text-gray-500">
                  No data available
                </td>
              </tr>`
        }

        <!-- Totals -->
        <tr class="bg-gray-100 font-semibold">
          <td colspan="2" class="border p-2 text-right">Total:</td>
          <td class="border p-2 text-right">
            (${currentCurrency.name}) ${report?.totals?.totalValueExcl?.toFixed(2) || "0.00"}
          </td>
          <td class="border p-2"></td>
          <td class="border p-2 text-right">
            (${currentCurrency.name}) ${report?.totals?.totalVatAmount?.toFixed(2) || "0.00"}
          </td>
          <td class="border p-2 text-right">
            (${currentCurrency.name}) ${report?.totals?.totalSD?.toFixed(2) || "0.00"}
          </td>
        </tr>

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

export default SalesSummaryReportPrint;