import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PdfBalanceSheetReport = (
  reportData: any,
  currentCurrency: any,
  queryParams: any,
  reportType: string
) => {
  const logo = appConfiguration.logo;
  const report = reportData?.data;

  // Create new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Add logo and header
  const addHeader = () => {
  const logoWidth = 50;
  const logoHeight = 15;
  const logoX = (pageWidth - logoWidth) / 2;
  const logoY = margin; // keep logo near top
  doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Now position title BELOW the logo (adds spacing)
  const titleY = logoY + logoHeight + 8; // 8mm gap under logo
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Balance Sheet Report", pageWidth / 2, titleY, { align: "center" });

  // Adjust other text positions relative to title
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, margin, titleY + 15);
  doc.text(`From: ${queryParams.fromDate}`, pageWidth / 2 - 20, titleY + 15);
  doc.text(`To: ${queryParams.toDate}`, pageWidth - margin, titleY + 15, { align: "right" });

  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, titleY + 22, { align: "center" });

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(margin, titleY + 25, pageWidth - margin, titleY + 25);
  };

  // Assets table data
  const assetsTableData: any[] = [];
  if (report?.assets) {
    report.assets.forEach((group: any) => {
      // Add group header
      assetsTableData.push([
        { 
          content: group.groupName, 
          styles: { 
            fontStyle: 'bold', 
            fillColor: [243, 244, 246],
            textColor: [0, 0, 0]
          } 
        },
        { content: '', styles: { fillColor: [243, 244, 246] } },
        { content: '', styles: { fillColor: [243, 244, 246] } },
        { content: '', styles: { fillColor: [243, 244, 246] } }
      ]);

      // Add accounts
      if (group.account && group.account.length > 0) {
        group.account.forEach((item: any) => {
          assetsTableData.push([
            item.account || "-",
            item.classification || "-",
            { 
              content: `(${currentCurrency.name}) ${item.amount?.toFixed(2) || "0.00"}`,
              styles: { halign: 'right' }
            },
            ""
          ]);
        });
      } else {
        assetsTableData.push([
          { 
            content: "No accounts", 
            colSpan: 4, 
            styles: { 
              halign: 'center', 
              textColor: [128, 128, 128] 
            } 
          }
        ]);
      }

      // Add group total
      assetsTableData.push([
        { 
          content: `Total ${group.groupName}`, 
          styles: { fontStyle: 'bold', fillColor: [229, 231, 235] } 
        },
        { content: '', styles: { fillColor: [229, 231, 235] } },
        { content: '', styles: { fillColor: [229, 231, 235] } },
        { 
          content: `(${currentCurrency.name}) ${group.totalAmount?.toFixed(2) || "0.00"}`,
          styles: { 
            fontStyle: 'bold', 
            halign: 'right',
            fillColor: [229, 231, 235] 
          } 
        }
      ]);

      // Add spacing row
      assetsTableData.push([
        { content: '', colSpan: 4, styles: { fillColor: [255, 255, 255] } }
      ]);
    });
  } else {
    assetsTableData.push([
      { 
        content: "No assets data", 
        colSpan: 4, 
        styles: { 
          halign: 'center', 
          textColor: [128, 128, 128] 
        } 
      }
    ]);
  }

  // Add total assets row
  assetsTableData.push([
    { 
      content: "TOTAL ASSETS", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [209, 213, 219],
        fontSize: 12
      } 
    },
    { content: '', styles: { fillColor: [209, 213, 219] } },
    { content: '', styles: { fillColor: [209, 213, 219] } },
    { 
      content: `(${currentCurrency.name}) ${report?.totalAssets?.toFixed(2) || "0.00"}`,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right',
        fontSize: 12,
        fillColor: [209, 213, 219]
      } 
    }
  ]);

  // Liabilities table data
  const liabilitiesTableData: any[] = [];
  if (report?.liabilities) {
    report.liabilities.forEach((group: any) => {
      // Add group header
      liabilitiesTableData.push([
        { 
          content: group.groupName, 
          styles: { 
            fontStyle: 'bold', 
            fillColor: [243, 244, 246],
            textColor: [0, 0, 0]
          } 
        },
        { content: '', styles: { fillColor: [243, 244, 246] } },
        { content: '', styles: { fillColor: [243, 244, 246] } },
        { content: '', styles: { fillColor: [243, 244, 246] } }
      ]);

      // Add accounts
      if (group.account && group.account.length > 0) {
        group.account.forEach((item: any) => {
          liabilitiesTableData.push([
            item.account || "-",
            item.classification || "-",
            { 
              content: `(${currentCurrency.name}) ${item.amount?.toFixed(2) || "0.00"}`,
              styles: { halign: 'right' }
            },
            ""
          ]);
        });
      } else {
        liabilitiesTableData.push([
          { 
            content: "No accounts", 
            colSpan: 4, 
            styles: { 
              halign: 'center', 
              textColor: [128, 128, 128] 
            } 
          }
        ]);
      }

      // Add group total
      liabilitiesTableData.push([
        { 
          content: `Total ${group.groupName}`, 
          styles: { fontStyle: 'bold', fillColor: [229, 231, 235] } 
        },
        { content: '', styles: { fillColor: [229, 231, 235] } },
        { content: '', styles: { fillColor: [229, 231, 235] } },
        { 
          content: `(${currentCurrency.name}) ${group.totalAmount?.toFixed(2) || "0.00"}`,
          styles: { 
            fontStyle: 'bold', 
            halign: 'right',
            fillColor: [229, 231, 235] 
          } 
        }
      ]);

      // Add spacing row
      liabilitiesTableData.push([
        { content: '', colSpan: 4, styles: { fillColor: [255, 255, 255] } }
      ]);
    });
  } else {
    liabilitiesTableData.push([
      { 
        content: "No liabilities data", 
        colSpan: 4, 
        styles: { 
          halign: 'center', 
          textColor: [128, 128, 128] 
        } 
      }
    ]);
  }

  // Add Owner's Equity
  liabilitiesTableData.push([
    { 
      content: "Owner's Equity", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [243, 244, 246] 
      } 
    },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { 
      content: `(${currentCurrency.name}) ${report?.ownerSecurity?.toFixed(2) || "0.00"}`,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right',
        fillColor: [243, 244, 246] 
      } 
    }
  ]);

  // Add total liabilities & equity row
  liabilitiesTableData.push([
    { 
      content: "TOTAL LIABILITIES & EQUITY", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [209, 213, 219],
        fontSize: 12
      } 
    },
    { content: '', styles: { fillColor: [209, 213, 219] } },
    { content: '', styles: { fillColor: [209, 213, 219] } },
    { 
      content: `(${currentCurrency.name}) ${report?.totalLiabilitiesAndEquity?.toFixed(2) || "0.00"}`,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right',
        fontSize: 12,
        fillColor: [209, 213, 219]
      } 
    }
  ]);

  // Add header to first page
  addHeader();

  // Add Assets section title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ASSETS", margin, margin + 45);

  // Create assets table
  autoTable(doc, {
    startY: margin + 50,
    head: [[
      { content: 'Account', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Classification', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } }
    ]],
    body: assetsTableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [209, 213, 219],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto', halign: 'right' },
      3: { cellWidth: 'auto', halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  // Get the final Y position after assets table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page for liabilities
  if (finalY > pageHeight - 100) {
    doc.addPage();
    addHeader();
  }

  // Add Liabilities section title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LIABILITIES & EQUITY", margin, (doc as any).lastAutoTable.finalY + 20);

  // Create liabilities table
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [[
      { content: 'Account', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Classification', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } }
    ]],
    body: liabilitiesTableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [209, 213, 219],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto', halign: 'right' },
      3: { cellWidth: 'auto', halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  // Add signatures section
  const signaturesY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const signatureWidth = (pageWidth - 2 * margin) / 4;
  const signatures = ["General Manager", "Finance Manager", "Accounts Officer", "Prepared By"];
  
  signatures.forEach((signature, index) => {
    const x = margin + (signatureWidth * index) + (signatureWidth / 2);
    doc.text(signature, x, signaturesY, { align: "center" });
    doc.line(x - 20, signaturesY + 2, x + 20, signaturesY + 2);
  });

  // Save the PDF
  const fileName = `balance-sheet-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default PdfBalanceSheetReport;