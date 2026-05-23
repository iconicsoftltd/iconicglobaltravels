import { appConfiguration } from "@/utils/constant/appConfiguration";
import { format } from "date-fns";

const TrialBalanceReportPrint2 = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string,
) => {
  const logo = appConfiguration.logo;

  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Trial Balance Report</title>

<script src="https://cdn.tailwindcss.com"></script>

<style>
@media print{
body{-webkit-print-color-adjust:exact}
}
</style>

</head>

<body class="p-6 text-gray-900 font-sans">

<div class="max-w-6xl mx-auto space-y-6">

<!-- Header -->
<div class="text-center border-b pb-4">

<img src="${logo}" class="mx-auto h-14 mb-2"/>

<h1 class="text-2xl font-bold uppercase">
Trial Balance Report
</h1>

<div class="flex justify-center gap-6 text-sm mt-2">
<p><b>Period:</b> ${reportType}</p>
<p><b>From:</b> ${
    queryParams.fromDate
      ? format(new Date(queryParams.fromDate), "dd MMM yyyy")
      : "-"
  }</p>
<p><b>To:</b> ${
    queryParams.toDate
      ? format(new Date(queryParams.toDate), "dd MMM yyyy")
      : "-"
  }</p>
</div>

<p class="text-sm text-gray-600 mt-1">
Generated on: ${new Date().toLocaleString()}
</p>

</div>


<table class="w-full border border-gray-300 border-collapse text-sm">

<thead class="bg-gray-100">
<tr>
<th class="border p-2">SL</th>
<th class="border p-2 text-left">Account Description</th>
<th class="border p-2 text-left">Ledger No</th>
<th class="border p-2 text-right">Debit</th>
<th class="border p-2 text-right">Credit</th>
</tr>
</thead>

<tbody>

<tr class="bg-gray-100 font-semibold">
<td colspan="5" class="border p-2">Opening Balance</td>
</tr>

<tr>
<td class="border p-2 text-center">1</td>
<td class="border p-2">Last Month Cash In Hand</td>
<td class="border p-2"></td>
<td class="border p-2 text-right">
${currentCurrency.name} ${Number(reportData.openingBalance).toFixed(2)}
</td>
<td class="border p-2"></td>
</tr>

<tr class="bg-gray-100 font-semibold">
<td colspan="5" class="border p-2">Inflows (Debit Items)</td>
</tr>

${reportData.inflows
  .map(
    (item: any, i: number) => `
<tr>
<td class="border p-2 text-center">${i + 2}</td>
<td class="border p-2">${item.accountDescription}</td>
<td class="border p-2">${item.ledgerNo}</td>
<td class="border p-2 text-right">
${currentCurrency.name} ${Number(item.debit).toFixed(2)}
</td>
<td class="border p-2 text-right">
${item.credit ? `${currentCurrency.name} ${item.credit.toFixed(2)}` : ""}
</td>
</tr>
`,
  )
  .join("")}

<tr class="bg-gray-100 font-semibold">
<td colspan="5" class="border p-2">Outflows (Credit Items)</td>
</tr>

${reportData.outflows
  .map(
    (item: any, i: number) => `
<tr>
<td class="border p-2 text-center">${reportData.inflows.length + i + 2}</td>
<td class="border p-2">${item.accountDescription}</td>
<td class="border p-2">${item.ledgerNo}</td>
<td class="border p-2 text-right">
${item.debit ? `${currentCurrency.name} ${item.debit.toFixed(2)}` : ""}
</td>
<td class="border p-2 text-right">
${currentCurrency.name} ${Number(item.credit).toFixed(2)}
</td>
</tr>
`,
  )
  .join("")}

<tr class="bg-gray-100 font-semibold">
<td colspan="5" class="border p-2">Closing Balance</td>
</tr>

<tr>
<td class="border p-2 text-center">
${reportData.inflows.length + reportData.outflows.length + 2}
</td>
<td class="border p-2">This Month Cash In Hand</td>
<td class="border p-2"></td>
<td class="border p-2 text-right">
${currentCurrency.name} ${Number(reportData.closingBalance).toFixed(2)}
</td>
<td class="border p-2"></td>
</tr>

<tr class="bg-gray-200 font-bold">
<td class="border p-2"></td>
<td class="border p-2">Total</td>
<td class="border p-2"></td>

<td class="border p-2 text-right">
${currentCurrency.name} ${Number(reportData.totals.debit).toFixed(2)}
</td>

<td class="border p-2 text-right">
${currentCurrency.name} ${Number(reportData.totals.credit).toFixed(2)}
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

export default TrialBalanceReportPrint2;