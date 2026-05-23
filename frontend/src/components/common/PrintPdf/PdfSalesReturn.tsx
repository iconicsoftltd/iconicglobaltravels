import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PdfSalesReturn = (selectedSalesReturnData: any[], currentCurrency: any) => {
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
  const addHeader = (salesReturn: any, isFirstPage: boolean = true) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    const logoWidth = 40;
    const logoHeight = 12;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = margin;
    
    // Add logo (uncomment if you have base64 logo)
    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Title
    const titleY = logoY + logoHeight + 5;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Return", pageWidth / 2, titleY, { align: "center" });

    // Customer and return info
    const customer = salesReturn.customer?.companyName || salesReturn.customer?.accountType || "N/A";
    const date = new Date(salesReturn.date).toLocaleString();

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Left side - Customer info
    doc.text(`Return Invoice No: ${salesReturn.invoiceNo}`, margin, titleY + 15);
    doc.text(`Customer Name: ${customer}`, margin, titleY + 22);
    doc.text(`Customer Balance: (${currentCurrency.name}) ${salesReturn.customer?.balance?.toFixed(2) || "0.00"}`, margin, titleY + 29);

    // Right side - Return info
    doc.text(`Return Date: ${date}`, pageWidth - margin, titleY + 15, { align: "right" });
    doc.text(`Payment Account: ${salesReturn.account?.accountType || "N/A"}`, pageWidth - margin, titleY + 22, { align: "right" });
    doc.text(`Account Balance: (${currentCurrency.name}) ${salesReturn.account?.balance?.toFixed(2) || "0.00"}`, pageWidth - margin, titleY + 29, { align: "right" });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(margin, titleY + 35, pageWidth - margin, titleY + 35);

    return titleY + 40; // Return the Y position for the table
  };

  // Process each sales return
  selectedSalesReturnData.forEach((salesReturn, salesReturnIndex) => {
    const salesReturnProducts = salesReturn.salesReturnProducts || [];
    let startY = addHeader(salesReturn, salesReturnIndex === 0);

    // Prepare table data
    const tableData = salesReturnProducts.map((prod: any, index: number) => [
      (index + 1).toString(),
      prod.productVariation?.product?.name || "-",
      prod.productVariation?.product?.brand?.name || "-",
      { 
        content: `${prod.quantity} ${prod.productVariation?.product?.unit?.name || ""}`,
        styles: { halign: 'right' }
      },
      { 
        content: prod.damageQuantity?.toString() || "0",
        styles: { 
          halign: 'right',
          textColor: [220, 38, 38] // red color for damaged
        }
      },
      { 
        content: `(${currentCurrency.name}) ${prod.unitPrice?.toFixed(2) || "0.00"}`,
        styles: { halign: 'right' }
      },
      { 
        content: `(${currentCurrency.name}) ${prod.subTotal?.toFixed(2) || "0.00"}`,
        styles: { halign: 'right' }
      }
    ]);

    // Create products table
    autoTable(doc, {
      startY: startY,
      head: [
        [
          'SN',
          'Product',
          'Brand',
          { content: 'Return Qty', styles: { halign: 'right' } },
          { content: 'Damaged', styles: { halign: 'right' } },
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
        0: { cellWidth: 10 },  // SN
        1: { cellWidth: 'auto' }, // Product
        2: { cellWidth: 'auto' }, // Brand
        3: { cellWidth: 20, halign: 'right' }, // Return Qty
        4: { cellWidth: 20, halign: 'right' }, // Damaged
        5: { cellWidth: 'auto', halign: 'right' }, // Unit Price
        6: { cellWidth: 'auto', halign: 'right' } // Subtotal
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
    const totalReturnAmount = salesReturn.totalAmount || 0;
    const refundAmount = salesReturn.totalPaymentAmount || 0;
    const adjustment = totalReturnAmount - refundAmount;
    const customerNewBalance = (salesReturn.customer?.balance - refundAmount) || 0;

    // Summary table
        const summaryData: any[][] = [
          [
            { content: `Total Return Amount:` },
            { 
              content: `(${currentCurrency.name}) ${totalReturnAmount.toFixed(2)}`,
              styles: { halign: 'right' } 
            }
          ],
          [
            { 
              content: `Refund Amount:`,
              styles: { textColor: [34, 197, 94] } // green color
            },
            { 
              content: `(${currentCurrency.name}) ${refundAmount.toFixed(2)}`,
              styles: { 
                halign: 'right',
                textColor: [34, 197, 94] // green color
              } 
            }
          ]
        ];

    // Add adjustment row if needed
    if (adjustment !== 0) {
      summaryData.push([
        { 
          content: `Adjustment:`,
          styles: { textColor: [220, 38, 38] } // red color
        },
        { 
          content: `(${currentCurrency.name}) ${adjustment.toFixed(2)}`,
          styles: { 
            halign: 'right',
            textColor: [220, 38, 38] // red color
          } 
        }
      ]);
    }

    // Add customer new balance
    summaryData.push([
      { 
        content: `Customer New Balance:`, 
        styles: { fontStyle: 'bold' } 
      },
      { 
        content: `(${currentCurrency.name}) ${customerNewBalance.toFixed(2)}`,
        styles: { 
          fontStyle: 'bold', 
          halign: 'right' 
        } 
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
    0: { cellWidth: (pageWidth - margin * 2) * 0.6, fontStyle: 'bold' },
    1: { cellWidth: (pageWidth - margin * 2) * 0.4, halign: 'right' },
  },
      margin: { left: margin, right: margin },
      tableLineWidth: 0,
      tableLineColor: [255, 255, 255]
    });

    // Add signatures on the last page of each sales return
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

    // Add page break for multiple sales returns (except the last one)
    if (salesReturnIndex < selectedSalesReturnData.length - 1) {
      doc.addPage();
    }
  });

  // Save the PDF
  const fileName = `sales-return-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default PdfSalesReturn;