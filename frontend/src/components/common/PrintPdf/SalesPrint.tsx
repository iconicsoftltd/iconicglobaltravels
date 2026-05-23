import { appConfiguration } from "@/utils/constant/appConfiguration";

const SalesPrint = (selectedSalesData: any[], currentCurrency: any) => {
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

  const salesHTML = selectedSalesData
    .map((sale, index) => {
      const saleProducts = sale.SaleProduct || [];
      const customer = sale.customer?.accountType || "N/A";
      const date = new Date(sale.date).toLocaleString();

      const productsHTML = saleProducts
        .map(
          (prod, i) => `
        <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
          <td class="border border-gray-300 px-3 py-2">${i + 1}</td>
          <td class="border border-gray-300 px-3 py-2">${prod.productVariation?.product?.name || "-"}</td>
          <td class="border border-gray-300 px-3 py-2">${prod.productVariation?.product?.brand?.name || "-"}</td>
          <td class="border border-gray-300 px-3 py-2">${prod.quantity} ${prod.productVariation?.product?.unit?.name || ""}</td>
          <td class="border border-gray-300 px-3 py-2">(${currentCurrency.name}) ${prod.unitPrice}</td>
          <td class="border border-gray-300 px-3 py-2 text-right">(${currentCurrency.name}) ${prod.subTotal}</td>
        </tr>`
        )
        .join("");

      return `
        <div class="p-6 no-break">
          <!-- Header -->
          <div class="text-center mb-4 border-b border-gray-300 pb-3">
            <img src="${logo}" alt="Logo" class="mx-auto h-14 mb-2" />
            <h2 class="text-xl font-bold uppercase tracking-wide">Sales</h2>
          </div>

          <!-- Info -->
          <div class="grid grid-cols-2 text-sm mb-4">
            <div>
              <p><span class="font-semibold">Invoice No:</span> ${sale.invoiceNo}</p>
              <p><span class="font-semibold">Party Name:</span> ${customer}</p>
            </div>
            <div class="text-right">
              <p><span class="font-semibold">Sale Date:</span> ${date}</p>
              <p><span class="font-semibold">Company:</span> EMCS</p>
            </div>
          </div>

          <!-- Table -->
          <table class="w-full border border-gray-300 text-sm border-collapse mb-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-3 py-2 text-left">SN</th>
                <th class="border border-gray-300 px-3 py-2 text-left">Product</th>
                <th class="border border-gray-300 px-3 py-2 text-left">Brand</th>
                <th class="border border-gray-300 px-3 py-2 text-left">Quantity</th>
                <th class="border border-gray-300 px-3 py-2 text-left">Unit Price</th>
                <th class="border border-gray-300 px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="text-right text-sm space-y-1 mb-6">
            <p><span class="font-semibold">Subtotal:</span>(${currentCurrency.name}) ${sale.totalAmount}</p>
            <p><span class="font-semibold">VAT:</span> ${sale.vat || 0}%</p>
            <p><span class="font-semibold">Discount:</span>(${currentCurrency.name}) ${sale.discount || 0}</p>
            <p><span class="font-semibold">Paid Amount:</span>(${currentCurrency.name}) ${sale.totalPaymentAmount}</p>
            <p><span class="font-semibold">Due Amount:</span>(${currentCurrency.name}) ${sale.dueAmount}</p>
          </div>
        </div>

        ${index < selectedSalesData.length - 1 ? "<div class='page-break'></div>" : ""}
      `;
    })
    .join("");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales</title>
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
          ${salesHTML}
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

export default SalesPrint;
