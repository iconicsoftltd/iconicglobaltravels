import { appConfiguration } from "@/utils/constant/appConfiguration";

const ServiceSalesPrint = (selectedSalesData: any[], currentCurrency: any) => {
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
      const serviceProducts = sale.serviceSaleProducts || [];
      const customer = sale.customer?.accountType || "N/A";
      const date = new Date(sale.date).toLocaleString();

      const productsHTML = serviceProducts
        .map((item: any, i: number) => {
          const service = item.service;
          return `
          <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
            <td class="border border-gray-300 px-3 py-2">${i + 1}</td>
            <td class="border border-gray-300 px-3 py-2 font-medium">${service?.name || "Unknown Service"}</td>
            <td class="border border-gray-300 px-3 py-2">${service?.description || "No description"}</td>
            <td class="border border-gray-300 px-3 py-2 text-center">${item.quantity}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">${currentCurrency.name} ${item.unitPrice?.toFixed(2)}</td>
            <td class="border border-gray-300 px-3 py-2 text-right">${currentCurrency.name} ${item.subTotal?.toFixed(2)}</td>
          </tr>
          `;
        })
        .join("");

      return `
      <div class="p-6">
        <!-- Header -->
        <div class="text-center mb-4 border-b border-gray-300 pb-3">
          <img src="${logo}" alt="Logo" class="mx-auto h-14 mb-2" />
          <h2 class="text-xl font-bold uppercase tracking-wide">Service Sales Invoice</h2>
        </div>

        <!-- Info -->
        <div class="grid grid-cols-2 text-sm mb-4">
          <div>
            <p><span class="font-semibold">Invoice No:</span> ${sale.invoiceNo}</p>
            <p><span class="font-semibold">Customer Name:</span> ${customer}</p>
            <p><span class="font-semibold">Email:</span> ${sale.customer?.email || "N/A"}</p>
          </div>
          <div class="text-right">
            <p><span class="font-semibold">Date:</span> ${date}</p>
            <p><span class="font-semibold">Payment Method:</span> ${sale.account?.accountType || "N/A"}</p>
            <p><span class="font-semibold">Phone:</span> ${sale.customer?.mobileNumber || "N/A"}</p>
          </div>
        </div>

        <!-- Service Table -->
        <table class="w-full border border-gray-300 text-sm border-collapse mb-4">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 px-3 py-2 text-left">SN</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Service Name</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Description</th>
              <th class="border border-gray-300 px-3 py-2 text-center">Quantity</th>
              <th class="border border-gray-300 px-3 py-2 text-right">Unit Price</th>
              <th class="border border-gray-300 px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTML}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="text-right text-sm space-y-2 mb-6">
          <div class="flex justify-between max-w-xs ml-auto">
            <span class="font-semibold">Subtotal:</span>
            <span>${currentCurrency.name} ${sale.totalAmount?.toFixed(2)}</span>
          </div>
          ${sale.vat > 0 ? `<div class="flex justify-between max-w-xs ml-auto"><span class="font-semibold">VAT:</span><span>${currentCurrency.name} ${sale.vat?.toFixed(2)}</span></div>` : ''}
          ${sale.discount > 0 ? `<div class="flex justify-between max-w-xs ml-auto"><span class="font-semibold">Discount:</span><span>${currentCurrency.name} ${sale.discount?.toFixed(2)}</span></div>` : ''}
          <div class="flex justify-between max-w-xs ml-auto border-t pt-2"><span class="font-semibold">Net Amount:</span><span>${currentCurrency.name} ${sale.totalAmount?.toFixed(2)}</span></div>
          <div class="flex justify-between max-w-xs ml-auto text-green-600"><span class="font-semibold">Paid Amount:</span><span>${currentCurrency.name} ${sale.totalPaymentAmount?.toFixed(2)}</span></div>
          ${sale.dueAmount > 0 ? `<div class="flex justify-between max-w-xs ml-auto text-red-600 border-t pt-2"><span class="font-semibold">Due Amount:</span><span>${currentCurrency.name} ${sale.dueAmount?.toFixed(2)}</span></div>` : ''}
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
        <title>Service Sales</title>
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

export default ServiceSalesPrint;
