import { formatDate } from "date-fns";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useVoucherPrint = () => {
  const printVoucher = (voucherData: any) => {
    if (!voucherData) {
      alert("No data provided for printing");
      return;
    }

    const { logo, address, email, phone, website } = voucherData?.config || {};

    // Build table rows HTML
    const rowsHTML = voucherData?.rows
      ?.map(
        (row: any, index: number) => `
      <div class="grid grid-cols-12 items-center pt-2 text-center gap-2">
        <div class="px-2 py-2 col-span-1 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
          ${index + 1}
        </div>
        <div class="col-span-2 px-3 py-2 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800">
          ${row.type}
        </div>
        <div class="col-span-4 px-3 py-2 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800 text-left pl-4">
          ${row.particulars}
        </div>
        <div class="col-span-2 px-3 py-2 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800 text-right">
          ${row.debit.toFixed(2)}
        </div>
        <div class="col-span-3 px-3 py-2 border bg-[#efedf7] border-[#e4e0ff] font-medium text-gray-800 text-right">
          ${row.credit.toFixed(2)}
        </div>
      </div>`
      )
      .join("");

    // Total row
    const totalHTML = `
      <div class="grid grid-cols-12 p-2 font-semibold text-center text-gray-700 bg-gray-50 gap-2">
        <div class="col-span-7 mt-2 text-right pr-4">Total Amount:</div>
        <div class="col-span-2 px-3 py-2 border border-[#e4e0ff] font-medium text-gray-800">
          ${voucherData.totalDebit.toFixed(2)}
        </div>
        <div class="col-span-3 px-3 py-2 border border-[#e4e0ff] font-medium text-gray-800">
          ${voucherData.totalCredit.toFixed(2)}
        </div>
      </div>
    `;

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

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt Voucher</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
            body { margin: 0; padding: 20px; font-family: 'Segoe UI', sans-serif; background: #fff; }
            .container { max-width: 100%; margin: 0 auto; }
            .header-section { text-align: center; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; padding:20px 0; margin-bottom:24px; }
            .logo { height: 40px; object-fit: contain; margin-bottom:8px; }
            .address-line, .contact-line, .website-line { display:flex; justify-content:center; gap:8px; color:#374151; font-size:14px; margin-bottom:4px; }
            .main-title { text-align:center; color:#5e48d8; font-size:24px; font-weight:600; margin-bottom:16px; }
            .voucher-info { display:flex; justify-content:space-between; color:#5e48d8; font-weight:500; margin-bottom:24px; gap:16px; }
            .table-container { overflow:hidden; }
            .table-header { display:grid; grid-template-columns:repeat(12,1fr); background-color:#efedf7; padding:4px; font-weight:600; color:#374151; text-align:center; border-bottom:1px solid #e5e7eb; }
            .table-row { display:grid; grid-template-columns:repeat(12,1fr); align-items:center; padding-top:6px; text-align:center; gap:8px; }
            .table-cell { padding:8px 12px; border:1px solid #e4e0ff; background-color:#efedf7; font-weight:500; color:#1f2937; }
            .text-left { text-align:left; padding-left:16px; }
            .text-right { text-align:right; padding-right:16px; }
            .total-section { display:grid; grid-template-columns:repeat(12,1fr); padding:8px; font-weight:600; text-align:center; background-color:#f9fafb; color:#374151; gap:8px; }
            .amount-words { margin-top:16px; padding:12px; background-color:#efedf7; border:1px solid #e5e7eb; border-radius:6px; text-align:center; font-weight:500; color:#374151; }
            .notes-section { margin-top:24px; }
            .notes-title { font-weight:600; color:#374151; margin-bottom:8px; }
            .notes-content { padding:12px; background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; }
            .notes-textarea { width:50%; min-height:80px; border:none; background:transparent; resize:none; outline:none; color:#4b5563; }
            .authorized-section { display:flex; justify-content:space-between; gap:16px; margin-top:24px; }
            .authorized-item { text-align:center; color:#4b5563; font-size:14px; text-decoration:underline; }
            @media print { body { margin:0; padding:0; } .container { box-shadow:none; border:none; } .no-print { display:none !important; } }
          </style>
        </head>
        <body>
          <div class="w-full  text-sm">
            <!-- Header -->
            <div class="header-section">
              <img src="${logo}" class="logo" />
              <div class="address-line">${address || ""}</div>
              <div class="contact-line"><span>${
                email || ""
              }</span><span>|</span><span>${phone || ""}</span></div>
              <div class="website-line">${website || ""}</div>
            </div>

            <h2 class="main-title">Receipt Voucher</h2>

            <div class="voucher-info">
              <div>Voucher No: ${voucherData.voucherNo}</div>
              <div>Date: ${formatDate(voucherData.date, "dd, MMM, yyy")}</div>
            </div>

            <div class="table-container">
              <div class="table-header">
                <div class="col-span-1 text-[#5e48d8] font-medium">Index No.</div>
                <div class="col-span-2 text-[#5e48d8] font-medium">Debit / Credit</div>
                <div class="col-span-4 text-[#5e48d8] font-medium">Particulars</div>
                <div class="col-span-2 text-[#5e48d8] font-medium">Debit</div>
                <div class="col-span-3 text-[#5e48d8] font-medium">Credit</div>
              </div>

              ${rowsHTML}
              ${totalHTML}
            </div>

            <div class="amount-words mb-[60px]">(IN WORD: ${
              voucherData.amountInWords
            })</div>

            <div class="authorized-section">
              <div class="authorized-item">Authorised By</div>
              <div class="authorized-item">Account</div>
              <div class="authorized-item">Signature</div>
            </div>
          </div>

          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }, 500);
          </script>
        </body>
      </html>
    `);

    doc.close();

    // Clean up iframe after printing
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  return { printVoucher };
};
