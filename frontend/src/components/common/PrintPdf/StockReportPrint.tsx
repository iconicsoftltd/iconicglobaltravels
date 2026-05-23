import { appConfiguration } from "@/utils/constant/appConfiguration";
import { format } from "date-fns";

const StockReportPrint = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string,
) => {
  const logo = appConfiguration.logo;
  const report = reportData?.data;

  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Stock Report</title>
<script src="https://cdn.tailwindcss.com"></script>

<style>
@media print {
  body { -webkit-print-color-adjust: exact; }
}
</style>

</head>

<body class="p-6 text-gray-900 font-sans">

<div class="max-w-7xl mx-auto space-y-6">

<!-- Header -->
<div class="text-center border-b pb-4">
<img src="${logo}" class="mx-auto h-14 mb-2"/>

<h1 class="text-2xl font-bold uppercase">
Stock Report
</h1>

<div class="flex justify-center gap-6 text-sm mt-2">
<p><b>Period:</b> ${reportType}</p>

<p><b>From:</b>
${
  queryParams.fromDate
    ? format(new Date(queryParams.fromDate), "dd MMM yyyy")
    : "-"
}
</p>

<p><b>To:</b>
${
  queryParams.toDate ? format(new Date(queryParams.toDate), "dd MMM yyyy") : "-"
}
</p>
</div>

<p class="text-sm text-gray-600 mt-1">
Generated on: ${new Date().toLocaleString()}
</p>

</div>


<!-- Table -->
<table class="w-full border border-gray-300 border-collapse text-xs">

<thead class="bg-gray-100">
<tr>

<th class="border p-2">SL</th>
<th class="border p-2">Product</th>
<th class="border p-2">Brand</th>
<th class="border p-2">Category</th>
<th class="border p-2">Sub Category</th>
<th class="border p-2">Size</th>

<th class="border p-2 text-right">Purchase</th>
<th class="border p-2 text-right">Sale</th>
<th class="border p-2 text-right">Purchase Return</th>
<th class="border p-2 text-right">Sale Return</th>

<th class="border p-2 text-right">Current Stock</th>
<th class="border p-2 text-right">Unit Price</th>

<th class="border p-2 text-right">Stock Value (Purchase)</th>
<th class="border p-2 text-right">Stock Value (Sale)</th>
<th class="border p-2 text-right">Stock Value (Wholesale)</th>

<th class="border p-2 text-right">Transfer</th>

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

<td class="border p-2">${row.productName || "-"}</td>
<td class="border p-2">${row.brand || "-"}</td>
<td class="border p-2">${row.category || "-"}</td>
<td class="border p-2">${row.subCategory || "-"}</td>
<td class="border p-2 text-center">${row.size || "-"}</td>

<td class="border p-2 text-right">${row.purchaseQty || 0}</td>
<td class="border p-2 text-right">${row.saleQty || 0}</td>
<td class="border p-2 text-right">${row.purchaseReturnQty || 0}</td>
<td class="border p-2 text-right">${row.saleReturnQty || 0}</td>

<td class="border p-2 text-right">${row.currentStock || 0}</td>

<td class="border p-2 text-right">
${currentCurrency.name} ${row.purchasePrice?.toFixed(2) || "0.00"}
</td>

<td class="border p-2 text-right">
${currentCurrency.name} ${row.stockValuePurchase?.toFixed(2) || "0.00"}
</td>

<td class="border p-2 text-right">
${currentCurrency.name} ${row.stockValueSale?.toFixed(2) || "0.00"}
</td>

<td class="border p-2 text-right">
N/A
</td>

<td class="border p-2 text-right">N/A</td>

</tr>
`,
        )
        .join("")
    : `
<tr>
<td colspan="16" class="text-center p-4 text-gray-500">
No data available
</td>
</tr>`
}


<!-- Totals -->
<tr class="bg-gray-100 font-semibold">

<td colspan="6" class="border p-2 text-right">
Total
</td>

<td class="border p-2 text-right">
${report?.summary?.totalPurchase || 0}
</td>

<td class="border p-2 text-right">
${report?.summary?.totalSale || 0}
</td>

<td class="border p-2 text-right">
${report?.summary?.totalPurchaseReturn || 0}
</td>

<td class="border p-2 text-right">
${report?.summary?.totalSaleReturn || 0}
</td>

<td class="border p-2 text-right">
${report?.summary?.totalStock || 0}
</td>

<td class="border p-2 text-right">
${currentCurrency.name}
${report?.summary?.totalPurchasePrice?.toFixed(2) || "0.00"}
</td>

<td class="border p-2 text-right">
${currentCurrency.name}
${report?.summary?.totalStockValuePurchase?.toFixed(2) || "0.00"}
</td>

<td class="border p-2 text-right">
${currentCurrency.name}
${report?.summary?.totalStockValueSale?.toFixed(2) || "0.00"}
</td>

<td class="border p-2 text-right">
${currentCurrency.name}
${report?.summary?.stockValueWholesale?.toFixed(2) || "0.00"}
</td>

<td class="border p-2 text-right">
${report?.summary?.totalTransfer || 0}
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

export default StockReportPrint;
