import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PdfQuotation = (selectedQuotationData: any[], currentCurrency: any) => {
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
  const addHeader = (quotation: any, isFirstPage: boolean = true) => {
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
    doc.text("QUOTATION", pageWidth / 2, titleY, { align: "center" });

    // Customer and quotation info
    const customer = quotation.customer?.accountType || "N/A";
    const date = new Date(quotation.date).toLocaleString();

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Left side - Customer info
    doc.text(`Quotation No: ${quotation.invoiceNo}`, margin, titleY + 15);
    doc.text(`Customer Name: ${customer}`, margin, titleY + 22);
    doc.text(`Email: ${quotation.customer?.email || "N/A"}`, margin, titleY + 29);
    doc.text(`Phone: ${quotation.customer?.mobileNumber || "N/A"}`, margin, titleY + 36);

    // Right side - Quotation info
    doc.text(`Date: ${date}`, pageWidth - margin, titleY + 15, { align: "right" });
    doc.text(`Company: EMCS`, pageWidth - margin, titleY + 22, { align: "right" });
    doc.text(`Address: ${quotation.customer?.address || "N/A"}`, pageWidth - margin, titleY + 29, { align: "right" });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(margin, titleY + 45, pageWidth - margin, titleY + 45);

    return titleY + 50; // Return the Y position for the table
  };

  // Process each quotation
  selectedQuotationData.forEach((quotation, quotationIndex) => {
    const quotationProducts = quotation.quotationProducts || [];
    let startY = addHeader(quotation, quotationIndex === 0);

    // Prepare table data
    const tableData = quotationProducts.map((prod: any, index: number) => {
      const variation = prod.productVariation;
      const product = variation?.product;
      
      return [
        (index + 1).toString(),
        product?.name || "-",
        product?.brand?.name || "-",
        product?.category?.name || "-",
        variation?.color?.name || "-",
        variation?.size?.name || "-",
        `${prod.quantity} ${product?.unit?.name || ""}`,
        { 
          content: `(${currentCurrency.name}) ${prod.unitPrice || "0.00"}`,
          styles: { halign: 'right' }
        },
        { 
          content: `(${currentCurrency.name}) ${prod.subTotal || "0.00"}`,
          styles: { halign: 'right' }
        }
      ];
    });

    // Create products table
    autoTable(doc, {
      startY: startY,
      head: [
        [
          'SL',
          'Product',
          'Brand',
          'Category',
          'Color',
          'Size',
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
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 8 }, // SL
        1: { cellWidth: 'auto' }, // Product
        2: { cellWidth: 'auto' }, // Brand
        3: { cellWidth: 'auto' }, // Category
        4: { cellWidth: 'auto' }, // Color
        5: { cellWidth: 'auto' }, // Size
        6: { cellWidth: 'auto' }, // Quantity
        7: { cellWidth: 'auto', halign: 'right' }, // Unit Price
        8: { cellWidth: 'auto', halign: 'right' } // Subtotal
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
    const subtotal = quotation.totalAmount || 0;
    const vat = quotation.vat || 0;
    const discount = quotation.discount || 0;
    const tc = quotation.tc || 0;

    // Summary table
    const summaryData = [
      [
        { content: `Subtotal:` },
        { 
          content: `(${currentCurrency.name}) ${subtotal.toFixed(2)}`,
          styles: { halign: 'right' as const } 
        }
      ],
      [
        { content: `VAT:` },
        { 
          content: `${vat}%`,
          styles: { halign: 'right' as const } 
        }
      ],
      [
        { content: `Discount:` },
        { 
          content: `(${currentCurrency.name}) ${discount.toFixed(2)}`,
          styles: { halign: 'right' as const } 
        }
      ]
    ];

    // Add Terms & Conditions if exists
    if (tc > 0) {
      summaryData.push([
        { content: `Terms & Conditions:` },
        { 
          content: `(${currentCurrency.name}) ${tc.toFixed(2)}`,
          styles: { halign: 'right' as const } 
        }
      ]);
    }

    // Add Grand Total
    summaryData.push([
      { content: `Grand Total:` },
      { 
        content: `(${currentCurrency.name}) ${subtotal.toFixed(2)}`,
        styles: { halign: 'right' as const } 
      }
    ]);

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
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      didDrawCell: function(data) {
        if (data.row.index === summaryData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: margin, right: margin },
      tableLineWidth: 0,
      tableLineColor: [255, 255, 255]
    });

    // Add signatures on the last page of each quotation
    const signaturesY = pageHeight - 25;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const signatureWidth = (pageWidth - 2 * margin) / 3;
    const signatures = ["Customer Signature", "Authorized Signature", "Prepared By"];
    
    signatures.forEach((signature, index) => {
      const x = margin + (signatureWidth * index) + (signatureWidth / 2);
      doc.text(signature, x, signaturesY, { align: "center" });
      doc.line(x - 25, signaturesY + 2, x + 25, signaturesY + 2);
    });

    // Add validity period note
    const validityY = signaturesY + 10;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("This quotation is valid for 30 days from the date of issue.", pageWidth / 2, validityY, { align: "center" });

    // Add page break for multiple quotations (except the last one)
    if (quotationIndex < selectedQuotationData.length - 1) {
      doc.addPage();
    }
  });

  // Save the PDF
  const fileName = `quotation-${selectedQuotationData[0]?.invoiceNo || new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default PdfQuotation;