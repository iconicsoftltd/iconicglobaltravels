import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PdfOwnerSecurityReport = (
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
    const logoY = margin;
    // Add logo (uncomment if you have base64 logo)
    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Title below logo
    const titleY = logoY + logoHeight + 8;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Owner's Equity Report", pageWidth / 2, titleY, { align: "center" });

    // Report details
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

  // Main table data
  const mainTableData: any[] = [];

  // Add Equity items
  if (report?.addEquity && report.addEquity.length > 0) {
    report.addEquity.forEach((item: any) => {
      mainTableData.push([
        item.account || "-",
        item.classification || "-",
        { 
          content: `(${currentCurrency.name}) ${item.amount?.toLocaleString() || "0.00"}`,
          styles: { halign: 'right' }
        },
        ""
      ]);
    });
  } else {
    mainTableData.push([
      { 
        content: "No equity data", 
        colSpan: 4, 
        styles: { 
          halign: 'center', 
          textColor: [128, 128, 128] 
        } 
      }
    ]);
  }

  // Add Net Income row
  const netIncomeText = `Net Income ${report?.netIncome >= 0 ? '(PROFIT)' : '(LOSS)'}`;
  mainTableData.push([
    { 
      content: netIncomeText, 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [243, 244, 246],
        fontSize: 11
      } 
    },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { 
      content: `(${currentCurrency.name}) ${report?.netIncome?.toLocaleString() || "0.00"}`,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right',
        fillColor: [243, 244, 246]
      } 
    }
  ]);

  // Add Less Equity items
  if (report?.lessEquity && report.lessEquity.length > 0) {
    report.lessEquity.forEach((item: any) => {
      mainTableData.push([
        item.account || "-",
        item.classification || "-",
        { 
          content: `(${currentCurrency.name}) ${item.amount?.toLocaleString() || "0.00"}`,
          styles: { halign: 'right' }
        },
        ""
      ]);
    });
  } else {
    mainTableData.push([
      { 
        content: "No withdrawal data", 
        colSpan: 4, 
        styles: { 
          halign: 'center', 
          textColor: [128, 128, 128] 
        } 
      }
    ]);
  }

  // Add Ending Capital row
  mainTableData.push([
    { 
      content: "Director's Share (ENDING CAPITAL)", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [209, 213, 219],
        fontSize: 12
      } 
    },
    { content: '', styles: { fillColor: [209, 213, 219] } },
    { content: '', styles: { fillColor: [209, 213, 219] } },
    { 
      content: `(${currentCurrency.name}) ${report?.endingCapital?.toLocaleString() || "0.00"}`,
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

  // Create main table
  autoTable(doc, {
    startY: margin + 50,
    head: [[
      { content: 'Account', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Classification', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } }
    ]],
    body: mainTableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
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
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Add signatures on the last page
      if (data.pageNumber === doc.internal.pages.length) {
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
      }
    }
  });

  // Save the PDF
  const fileName = `owners-equity-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default PdfOwnerSecurityReport;