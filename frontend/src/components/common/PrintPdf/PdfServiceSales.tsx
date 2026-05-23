import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PdfServiceSales = (selectedSalesData: any[], currentCurrency: any) => {
  const logo = appConfiguration.logo;

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

  // Add header function
  const addHeader = (sale: any, isFirstPage: boolean = true) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    const logoWidth = 40;
    const logoHeight = 12;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = margin;
    
    // Add logo
    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Title
    const titleY = logoY + logoHeight + 5;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Service Sales Invoice", pageWidth / 2, titleY, { align: "center" });

    // Customer and sale info
    const customer = sale.customer?.accountType || "N/A";
    const date = new Date(sale.date).toLocaleString();
    const paymentMethod = sale.account?.accountType || "N/A";

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Left side - Customer info
    doc.text(`Invoice No: ${sale.invoiceNo}`, margin, titleY + 15);
    doc.text(`Customer Name: ${customer}`, margin, titleY + 22);
    doc.text(`Email: ${sale.customer?.email || "N/A"}`, margin, titleY + 29);

    // Right side - Sale info
    doc.text(`Date: ${date}`, pageWidth - margin, titleY + 15, { align: "right" });
    doc.text(`Payment Method: ${paymentMethod}`, pageWidth - margin, titleY + 22, { align: "right" });
    doc.text(`Phone: ${sale.customer?.mobileNumber || "N/A"}`, pageWidth - margin, titleY + 29, { align: "right" });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(margin, titleY + 35, pageWidth - margin, titleY + 35);

    return titleY + 40; // Return the Y position for the table
  };

  // Process each sale
  selectedSalesData.forEach((sale, saleIndex) => {
    const serviceProducts = sale.serviceSaleProducts || [];
    let startY = addHeader(sale, saleIndex === 0);

    // Prepare table data for services
    const tableData = serviceProducts.map((serviceItem: any, index: number) => {
      const service = serviceItem.service;
      return [
        (index + 1).toString(),
        service?.name || "Unknown Service",
        service?.description || "No description",
        serviceItem.quantity.toString(),
        { 
          content: `${currentCurrency.name} ${serviceItem.unitPrice?.toFixed(2)}`,
          styles: { halign: 'right', fontStyle: 'bold' as const }
        },
        { 
          content: `${currentCurrency.name} ${serviceItem.subTotal?.toFixed(2)}`,
          styles: { halign: 'right', fontStyle: 'bold' as const }
        }
      ];
    });

    // Create services table
    autoTable(doc, {
      startY: startY,
      head: [
        [
          'SN',
          'Service Name',
          'Description',
          'Quantity',
          { content: 'Unit Price', styles: { halign: 'right' } },
          { content: 'Subtotal', styles: { halign: 'right' } }
        ]
      ],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [209, 213, 219],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 10 }, // SN
        1: { cellWidth: 'auto' }, // Service Name
        2: { cellWidth: 'auto' }, // Description
        3: { cellWidth: 20, halign: 'center' }, // Quantity
        4: { cellWidth: 'auto', halign: 'right' }, // Unit Price
        5: { cellWidth: 'auto', halign: 'right' } // Subtotal
      },
      margin: { left: margin, right: margin }
    });

    // Add summary section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page for summary
    if (finalY > pageHeight - 60) {
      doc.addPage();
      startY = margin;
    }

    // Summary calculations
    const subtotal = sale.totalAmount || 0;
    const vat = sale.vat || 0;
    const discount = sale.discount || 0;
    const paidAmount = sale.totalPaymentAmount || 0;
    const dueAmount = sale.dueAmount || 0;
    const netAmount = subtotal + vat - discount;

    // Prepare summary data
    const summaryData = [
      [
        { content: `Subtotal:`, styles: { fontStyle: 'bold' as const } },
        { 
          content: `${currentCurrency.name} ${subtotal.toFixed(2)}`,
          styles: { halign: 'right' as const, fontStyle: 'bold' as const } 
        }
      ]
    ];

    // Add VAT if applicable
    if (vat > 0) {
      summaryData.push([
        { content: `VAT:`, styles: { fontStyle: 'bold' as const } },
        { 
          content: `${currentCurrency.name} ${vat.toFixed(2)}`,
          styles: { halign: 'right' as const, fontStyle: 'bold' as const } 
        }
      ]);
    }

    // Add discount if applicable
    if (discount > 0) {
      summaryData.push([
        { content: `Discount:`, styles: { fontStyle: 'bold' as const } },
        { 
          content: `${currentCurrency.name} ${discount.toFixed(2)}`,
          styles: { halign: 'right' as const, fontStyle: 'bold' as const } 
        }
      ]);
    }

    // Add net amount
    summaryData.push([
      { content: `Net Amount:`, styles: { fontStyle: 'bold' as const } },
      { 
        content: `${currentCurrency.name} ${netAmount.toFixed(2)}`,
        styles: { halign: 'right' as const, fontStyle: 'bold' as const } 
      }
    ]);

    // Add paid amount
    summaryData.push([
      { content: `Paid Amount:`, styles: { fontStyle: 'bold' as const } },
      { 
        content: `${currentCurrency.name} ${paidAmount.toFixed(2)}`,
        styles: { halign: 'right' as const, fontStyle: 'bold' as const }
      }
    ]);

    // Add due amount if applicable
    if (dueAmount > 0) {
      summaryData.push([
        { content: `Due Amount:`, styles: { fontStyle: 'bold' as const } },
        { 
          content: `${currentCurrency.name} ${dueAmount.toFixed(2)}`,
          styles: { halign: 'right' as const, fontStyle: 'bold' as const }
        }
      ]);
    }

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      body: summaryData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: (pageWidth - margin * 2) * 0.6 },
        1: { cellWidth: (pageWidth - margin * 2) * 0.4, halign: 'right' },
      },
      margin: { left: margin, right: margin },
      tableLineWidth: 0,
      tableLineColor: [255, 255, 255]
    });

    // Add signatures on the last page of each sale
    const signaturesY = pageHeight - 25;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const signatureWidth = (pageWidth - 2 * margin) / 4;
    const signatures = ["General Manager (B D)", "Accounts", "Admin", "Prepared By"];
    
    signatures.forEach((signature, index) => {
      const x = margin + (signatureWidth * index) + (signatureWidth / 2);
      doc.text(signature, x, signaturesY, { align: "center" });
      doc.line(x - 18, signaturesY + 2, x + 18, signaturesY + 2);
    });

    // Add page break for multiple sales (except the last one)
    if (saleIndex < selectedSalesData.length - 1) {
      doc.addPage();
    }
  });

  // Save the PDF
  const fileName = `service-sales-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default PdfServiceSales;