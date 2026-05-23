import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PdfIncomeStatementReport = (
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
    doc.text("Income Statement Report", pageWidth / 2, titleY, { align: "center" });

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

  // Revenue table data
  const revenueTableData: any[] = [];
  
  // Add Revenue section header
  revenueTableData.push([
    { 
      content: "REVENUE", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [243, 244, 246],
        fontSize: 11
      } 
    },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { content: '', styles: { fillColor: [243, 244, 246] } }
  ]);

  // Add revenue items
  if (report?.revenue && report.revenue.length > 0) {
    report.revenue.forEach((item: any) => {
      revenueTableData.push([
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
    revenueTableData.push([
      { 
        content: "No revenue data", 
        colSpan: 4, 
        styles: { 
          halign: 'center', 
          textColor: [128, 128, 128] 
        } 
      }
    ]);
  }

  // Add total revenue
  revenueTableData.push([
    { 
      content: "Total Revenue", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [229, 231, 235],
        fontSize: 12
      } 
    },
    { content: '', styles: { fillColor: [229, 231, 235] } },
    { content: '', styles: { fillColor: [229, 231, 235] } },
    { 
      content: `(${currentCurrency.name}) ${report?.totalRevenue?.toFixed(2) || "0.00"}`,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right',
        fontSize: 12,
        fillColor: [229, 231, 235]
      } 
    }
  ]);

  // Add spacing row
  revenueTableData.push([
    { content: '', colSpan: 4, styles: { fillColor: [255, 255, 255] } }
  ]);

  // Expenses table data
  const expensesTableData: any[] = [];
  
  // Add Expenses section header
  expensesTableData.push([
    { 
      content: "EXPENSES", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [243, 244, 246],
        fontSize: 11
      } 
    },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { content: '', styles: { fillColor: [243, 244, 246] } },
    { content: '', styles: { fillColor: [243, 244, 246] } }
  ]);

  // Add expense items
  if (report?.expense && report.expense.length > 0) {
    report.expense.forEach((item: any) => {
      expensesTableData.push([
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
    expensesTableData.push([
      { 
        content: "No expense data", 
        colSpan: 4, 
        styles: { 
          halign: 'center', 
          textColor: [128, 128, 128] 
        } 
      }
    ]);
  }

  // Add total expenses
  expensesTableData.push([
    { 
      content: "Total Expenses", 
      styles: { 
        fontStyle: 'bold', 
        fillColor: [229, 231, 235],
        fontSize: 12
      } 
    },
    { content: '', styles: { fillColor: [229, 231, 235] } },
    { content: '', styles: { fillColor: [229, 231, 235] } },
    { 
      content: `(${currentCurrency.name}) ${report?.totalExpense?.toFixed(2) || "0.00"}`,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right',
        fontSize: 12,
        fillColor: [229, 231, 235]
      } 
    }
  ]);

  // Add spacing row
  expensesTableData.push([
    { content: '', colSpan: 4, styles: { fillColor: [255, 255, 255] } }
  ]);

  // Add net income row
  const netIncomeColor = report?.netIncome >= 0 ? [220, 252, 231] : [254, 226, 226]; // green-100 : red-100
  const netIncomeText = report?.netIncome >= 0 ? "NET INCOME (PROFIT)" : "NET INCOME (LOSS)";
  
  expensesTableData.push([
    { 
      content: netIncomeText, 
      styles: { 
        fontStyle: 'bold', 
        fillColor: netIncomeColor,
        fontSize: 12
      } 
    },
    { content: '', styles: { fillColor: netIncomeColor } },
    { content: '', styles: { fillColor: netIncomeColor } },
    { 
      content: `(${currentCurrency.name}) ${report?.netIncome?.toFixed(2) || "0.00"}`,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right',
        fontSize: 12,
        fillColor: netIncomeColor
      } 
    }
  ]);

  // Add header to first page
  addHeader();

  // Create main table with revenue and expenses
  autoTable(doc, {
    startY: margin + 50,
    head: [[
      { content: 'Account', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Classification', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } },
      { content: 'Amount', styles: { fontStyle: 'bold', fillColor: [249, 250, 251] } }
    ]],
    body: [...revenueTableData, ...expensesTableData],
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
  const fileName = `income-statement-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default PdfIncomeStatementReport;