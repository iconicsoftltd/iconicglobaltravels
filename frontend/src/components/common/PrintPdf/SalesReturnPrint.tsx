import { appConfiguration } from "@/utils/constant/appConfiguration";

const SalesReturnPrint = (selectedSalesReturnData: any[], currentCurrency: any) => {
  const logo = appConfiguration.logo;

  // Create hidden iframe for printing
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const salesReturnHTML = selectedSalesReturnData
    .map((salesReturn, index) => {
      const customer =
        salesReturn.customer?.companyName ||
        salesReturn.customer?.accountType ||
        "N/A";
      const date = new Date(salesReturn.date).toLocaleString();

      const productsHTML = salesReturn?.salesReturnProducts
        ?.map(
          (prod, i) => `
          <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
            <td class="border border-gray-300 px-3 py-2">${i + 1}</td>
            <td class="border border-gray-300 px-3 py-2">${prod.productVariation?.product?.name || "-"}</td>
            <td class="border border-gray-300 px-3 py-2">${prod.productVariation?.product?.brand?.name || "-"}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">${prod.quantity} ${prod.productVariation?.product?.unit?.name || ""}</td>
            <td class="border border-gray-300 px-3 py-2 text-right text-red-600">${prod.damageQuantity}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">(${currentCurrency.name}) ${prod.unitPrice?.toFixed(2)}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">(${currentCurrency.name}) ${prod.subTotal?.toFixed(2)}</td>
          </tr>`
        )
        .join("");

      return `
        <div class="p-6 no-break">
          <!-- Header -->
          <div class="text-center mb-4 border-b border-gray-300 pb-3">
            <img src="${logo}" alt="Logo" class="mx-auto h-14 mb-2" />
            <h2 class="text-xl font-bold uppercase tracking-wide">Sales Return</h2>
          </div>

          <!-- Info -->
          <div class="grid grid-cols-2 text-sm mb-4">
            <div>
              <p><span class="font-semibold">Return Invoice No:</span> ${salesReturn.invoiceNo}</p>
              <p><span class="font-semibold">Customer Name:</span> ${customer}</p>
              <p><span class="font-semibold">Customer Balance:</span> (${currentCurrency.name}) ${salesReturn.customer?.balance?.toFixed(2) || "0.00"}</p>
            </div>
            <div class="text-right">
              <p><span class="font-semibold">Return Date:</span> ${date}</p>
              <p><span class="font-semibold">Payment Account:</span> ${salesReturn.account?.accountType}</p>
              <p><span class="font-semibold">Account Balance:</span> (${currentCurrency.name}) ${salesReturn.account?.balance?.toFixed(2) || "0.00"}</p>
            </div>
          </div>

          <!-- Table -->
          <table class="w-full border border-gray-300 text-sm border-collapse mb-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-3 py-2 text-left">SN</th>
                <th class="border border-gray-300 px-3 py-2 text-left">Product</th>
                <th class="border border-gray-300 px-3 py-2 text-left">Brand</th>
                <th class="border border-gray-300 px-3 py-2 text-right">Return Qty</th>
                <th class="border border-gray-300 px-3 py-2 text-right">Damaged</th>
                <th class="border border-gray-300 px-3 py-2 text-right">Unit Price</th>
                <th class="border border-gray-300 px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="text-right text-sm space-y-1 mb-6">
            <p><span class="font-semibold">Total Return Amount:</span> (${currentCurrency.name}) ${salesReturn.totalAmount?.toFixed(2)}</p>
            <p class="text-green-600 font-medium"><span class="font-semibold">Refund Amount:</span> (${currentCurrency.name}) ${salesReturn.totalPaymentAmount?.toFixed(2)}</p>
            ${
              salesReturn.totalAmount !== salesReturn.totalPaymentAmount
                ? `<p class="text-red-600 font-medium"><span class="font-semibold">Adjustment:</span> (${currentCurrency.name}) ${(salesReturn.totalAmount - salesReturn.totalPaymentAmount)?.toFixed(2)}</p>`
                : ""
            }
            <p class="border-t pt-1 mt-1 font-semibold"><span class="font-semibold">Customer New Balance:</span> (${currentCurrency.name}) ${(salesReturn.customer?.balance - salesReturn.totalPaymentAmount)?.toFixed(2)}</p>
          </div>
        </div>

        ${index < selectedSalesReturnData.length - 1 ? "<div class='page-break'></div>" : ""}
      `;
    })
    .join("");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales Return</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          body { margin:0; padding:20px; font-family:'Segoe UI',sans-serif; background:#fff; color:#000; }
          .page-break { page-break-after: always; }
          .signature-section { position:absolute; bottom:20px; left:0; right:0; padding:0 24px; display:flex; justify-content:space-between; gap:16px; }
        </style>
      </head>
      <body>
        <div class="max-w-4xl mx-auto space-y-8">
          ${salesReturnHTML}
        </div>

        <div class="signature-section text-sm">
          <p class="font-semibold underline">General Manager (B D)</p>
          <p class="font-semibold underline">Accounts</p>
          <p class="font-semibold underline">Admin</p>
          <p class="font-semibold underline">Prepared By</p>
        </div>

        <script>
          setTimeout(() => {
            window.print();
            setTimeout(() => { window.close(); }, 500);
          }, 300);
        </script>
      </body>
    </html>
  `);
  doc.close();

  // Cleanup iframe after printing
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
};

export default SalesReturnPrint;
