import { appConfiguration } from "@/utils/constant/appConfiguration";

const ServiceSalesChalanPrint = (selectedSalesData: any[]) => {
  const logo = appConfiguration.logo;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Service Sales</title>
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
        }
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
      </style>
    </head>
    <body>
      <div class="max-w-4xl mx-auto space-y-8">

        ${selectedSalesData
          .map((sale, index) => {
            const serviceProducts = sale.serviceSaleProducts || [];
            const customer = sale.customer?.accountType || "N/A";
            const date = new Date(sale.date).toLocaleString();

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
                    </tr>
                  </thead>
                  <tbody>
                    ${serviceProducts
                      .map(
                        (serviceItem: any, i: number) => {
                          const service = serviceItem.service;
                          return `
                            <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"}">
                              <td class="border border-gray-300 px-3 py-2">${i + 1}</td>
                              <td class="border border-gray-300 px-3 py-2 font-medium">${service?.name || "Unknown Service"}</td>
                              <td class="border border-gray-300 px-3 py-2">${service?.description || "No description"}</td>
                              <td class="border border-gray-300 px-3 py-2 text-center">${serviceItem.quantity}</td>
                            </tr>
                          `;
                        }
                      )
                      .join("")}
                  </tbody>
                </table>

                <!-- Totals -->
               
              </div>

              ${index < selectedSalesData.length - 1 ? "<div class='page-break'></div>" : ""}
            `;
          })
          .join("")}
      </div>

      <div class="flex justify-between text-sm signature-section">
        <p class="font-semibold underline">General Manager (B D)</p>
        <p class="font-semibold underline">Accounts</p>
        <p class="font-semibold underline">Admin</p>
        <p class="font-semibold underline">Prepared By</p>
      </div>

    </body>
  </html>
  `;

  const width = 900;
  const height = 700;
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

export default ServiceSalesChalanPrint;