import { appConfiguration } from "@/utils/constant/appConfiguration";
import { format } from "date-fns";

const LedgerReportPrint = (
  ledgerData: any[],
  currentCurrency: any,
  queryParams: any,
  reportType: string,
) => {
  const logo = appConfiguration.logo;

  const html = `
<!DOCTYPE html>
<html>
<head>
<title>Ledger Report</title>
<script src="https://cdn.tailwindcss.com"></script>

<style>
@media print{
body{-webkit-print-color-adjust:exact}
}
</style>

</head>

<body class="p-6 text-gray-900 font-sans">

<div class="max-w-6xl mx-auto space-y-10">

<!-- Header -->
<div class="text-center border-b pb-4">
<img src="${logo}" class="mx-auto h-14 mb-2"/>

<h1 class="text-2xl font-bold uppercase">Ledger Report</h1>

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


${
  ledgerData?.length
    ? ledgerData
        .map(
          (account: any) => `

<!-- Account -->
<div class="space-y-2">

<h2 class="font-bold text-lg bg-gray-100 p-2 border">
${account.accountName}
</h2>

<table class="w-full border border-gray-300 border-collapse text-sm">

<thead class="bg-gray-100">

<tr>
<th rowspan="2" class="border p-2 text-left">Date</th>
<th rowspan="2" class="border p-2 text-left">Description</th>
<th rowspan="2" class="border p-2 text-left">Particular</th>  <!-- ✅ ADD -->
<th rowspan="2" class="border p-2 text-center">V.N/J.N</th>
<th rowspan="2" class="border p-2 text-right">Debit</th>
<th rowspan="2" class="border p-2 text-right">Credit</th>
<th colspan="2" class="border p-2 text-center">Balance</th>
</tr>

<tr>
<th class="border p-2 text-right">Debit</th>
<th class="border p-2 text-right">Credit</th>
</tr>

</thead>


<tbody>

${
  account.openingBalance?.balance
    ? `
<tr class="bg-gray-50 font-medium">
<td class="border p-2">
${format(new Date(account.openingBalance.date), "dd/MM/yyyy")}
</td>

<td class="border p-2">Balance b/d</td>
<td class="border p-2"></td>  <!-- ✅ Particular empty -->
<td class="border p-2"></td>
<td class="border p-2"></td>
<td class="border p-2"></td>

<td class="border p-2 text-right">
${
  account.openingBalance.balanceType === "Dr"
    ? `${currentCurrency.name} ${account.openingBalance.balance.toFixed(2)}`
    : ""
}
</td>

<td class="border p-2 text-right">
${
  account.openingBalance.balanceType === "Cr"
    ? `${currentCurrency.name} ${account.openingBalance.balance.toFixed(2)}`
    : ""
}
</td>

</tr>
`
    : ""
}

${
  account.transactions?.length
    ? account.transactions
        .map(
          (trx: any) => `
<tr>

<td class="border p-2 text-center">
${format(new Date(trx.date), "dd/MM/yyyy")}
</td>

<td class="border p-2">${trx.description}</td>
<td class="border p-2">${trx.oppositeAccount ?? "-"}</td>  <!-- ✅ ADD -->
<td class="border p-2 text-center">${trx.voucherNo || "-"}</td>

<td class="border p-2 text-right">
${trx.debit ? `${currentCurrency.name} ${Number(trx.debit).toFixed(2)}` : ""}
</td>

<td class="border p-2 text-right">
${trx.credit ? `${currentCurrency.name} ${Number(trx.credit).toFixed(2)}` : ""}
</td>

<td class="border p-2 text-right">
${
  trx.balanceType === "Dr"
    ? `${currentCurrency.name} ${Number(trx.balance).toFixed(2)}`
    : ""
}
</td>

<td class="border p-2 text-right">
${
  trx.balanceType === "Cr"
    ? `${currentCurrency.name} ${Number(trx.balance).toFixed(2)}`
    : ""
}
</td>

</tr>
`,
        )
        .join("")
    : `
<tr>
<td colspan="7" class="text-center p-4 text-gray-500">
No transactions
</td>
</tr>
`
}


<tr class="bg-gray-100 font-semibold">

<td class="border p-2">
${format(new Date(account.summary.closingBalance.date), "dd/MM/yyyy")}
</td>

<td class="border p-2">Balance c/d</td>

<td class="border p-2"></td>
<td class="border p-2"></td>
<td class="border p-2"></td>

<td class="border p-2 text-right">
${
  account.summary.closingBalance.balanceType === "Dr"
    ? `${currentCurrency.name} ${account.summary.closingBalance.balance.toFixed(
        2,
      )}`
    : ""
}
</td>

<td class="border p-2 text-right">
${
  account.summary.closingBalance.balanceType === "Cr"
    ? `${currentCurrency.name} ${account.summary.closingBalance.balance.toFixed(
        2,
      )}`
    : ""
}
</td>

</tr>

</tbody>
</table>
</div>
`,
        )
        .join("")
    : `<p class="text-center text-gray-500">No Data</p>`
}

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

export default LedgerReportPrint;
