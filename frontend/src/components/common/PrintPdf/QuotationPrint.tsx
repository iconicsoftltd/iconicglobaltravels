import { appConfiguration } from "@/utils/constant/appConfiguration";

const QuotationPrint = (selectedQuotationData: any[], currentCurrency: any) => {
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

  const quotationHTML = selectedQuotationData
    .map((quotation, index) => {
      const customer = quotation.customer?.accountType || "N/A";
      const date = new Date(quotation.date).toLocaleString();
      const productsHTML = (quotation.quotationProducts || [])
        .map((prod: any, i: number) => {
          const variation = prod.productVariation;
          const product = variation?.product;
          return `
          <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
            <td class="border border-gray-300 px-3 py-2 text-center">${i + 1}</td>
            <td class="border border-gray-300 px-3 py-2">${product?.name || "-"}</td>
            <td class="border border-gray-300 px-3 py-2">${product?.brand?.name || "-"}</td>
            <td class="border border-gray-300 px-3 py-2">${product?.category?.name || "-"}</td>
            <td class="border border-gray-300 px-3 py-2">${variation?.color?.name || "-"}</td>
            <td class="border border-gray-300 px-3 py-2">${variation?.size?.name || "-"}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">${prod.quantity} ${product?.unit?.name || ""}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">(${currentCurrency.name}) ${prod.unitPrice}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">(${currentCurrency.name}) ${prod.subTotal}</td>
          </tr>
          `;
        })
        .join("");

      return `
      <div class="p-6">
        <!-- Header -->
        <div class="text-center mb-4 border-b border-gray-300 pb-3">
          <img src="${logo}" alt="Logo" class="mx-auto h-14 mb-2" />
          <h2 class="text-xl font-bold uppercase tracking-wide">Quotation</h2>
        </div>

        <!-- Info -->
        <div class="grid grid-cols-2 text-sm mb-4">
          <div>
            <p><span class="font-semibold">Quotation No:</span> ${quotation.invoiceNo}</p>
            <p><span class="font-semibold">Customer Name:</span> ${customer}</p>
            <p><span class="font-semibold">Email:</span> ${quotation.customer?.email || "N/A"}</p>
            <p><span class="font-semibold">Phone:</span> ${quotation.customer?.mobileNumber || "N/A"}</p>
          </div>
          <div class="text-right">
            <p><span class="font-semibold">Date:</span> ${date}</p>
            <p><span class="font-semibold">Company:</span> EMCS</p>
            <p><span class="font-semibold">Address:</span> ${quotation.customer?.address || "N/A"}</p>
          </div>
        </div>

        <!-- Table -->
        <table class="w-full border border-gray-300 text-sm border-collapse mb-4">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 px-3 py-2 text-center">SL</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Product</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Brand</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Category</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Color</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Size</th>
              <th class="border border-gray-300 px-3 py-2 text-right">Quantity</th>
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
          <p><span class="font-semibold">Subtotal:</span> (${currentCurrency.name}) ${quotation.totalAmount}</p>
          <p><span class="font-semibold">VAT:</span> ${quotation.vat || 0}%</p>
          <p><span class="font-semibold">Discount:</span> (${currentCurrency.name}) ${quotation.discount || 0}</p>
          ${quotation.tc > 0 ? `<p><span class="font-semibold">Terms & Conditions:</span> (${currentCurrency.name}) ${quotation.tc}</p>` : ''}
          <p class="font-bold text-lg border-t pt-2 mt-2"><span class="font-semibold">Grand Total:</span> (${currentCurrency.name}) ${quotation.totalAmount}</p>
        </div>
      </div>

      ${index < selectedQuotationData.length - 1 ? "<div class='page-break'></div>" : ""}
      `;
    })
    .join("");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Quotation</title>
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
          ${quotationHTML}
        </div>

        <div class="signature-section text-sm">
          <p class="font-semibold underline">Customer Signature</p>
          <p class="font-semibold underline">Authorized Signature</p>
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

export default QuotationPrint;
