import { appConfiguration } from "@/utils/constant/appConfiguration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PdfPurchase = (selectedPurchaseData: any[], currentCurrency: any) => {
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
  const addHeader = (purchase: any, isFirstPage: boolean = true) => {
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
    doc.text("Purchase", pageWidth / 2, titleY, { align: "center" });

    // Supplier and purchase info
    const supplier = purchase.supplier?.companyName || purchase.supplier?.accountType || "N/A";
    const date = new Date(purchase.date).toLocaleString();

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Left side - Supplier info
    doc.text(`Challan No: ${purchase.challanNo}`, margin, titleY + 15);
    doc.text(`Supplier Name: ${supplier}`, margin, titleY + 22);
    doc.text(`Supplier Balance: (${currentCurrency.name}) ${purchase.supplier?.balance?.toFixed(2) || "0.00"}`, margin, titleY + 29);

    // Right side - Purchase info
    doc.text(`Purchase Date: ${date}`, pageWidth - margin, titleY + 15, { align: "right" });
    doc.text(`Payment Account: ${purchase.account?.accountType || "N/A"}`, pageWidth - margin, titleY + 22, { align: "right" });
    doc.text(`Account Balance: (${currentCurrency.name}) ${purchase.account?.balance?.toFixed(2) || "0.00"}`, pageWidth - margin, titleY + 29, { align: "right" });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(margin, titleY + 35, pageWidth - margin, titleY + 35);

    return titleY + 40; // Return the Y position for the table
  };

  // Process each purchase
  selectedPurchaseData.forEach((purchase, purchaseIndex) => {
    const purchaseProducts = purchase.PurchaseProduct || [];
    let startY = addHeader(purchase, purchaseIndex === 0);

    // Prepare table data
    const tableData = purchaseProducts.map((prod: any, index: number) => [
      (index + 1).toString(),
      prod.productVariation?.product?.name || "-",
      prod.productVariation?.product?.brand?.name || "-",
      `${prod.quantity} ${prod.productVariation?.product?.unit?.name || ""}`,
      { 
        content: prod.damageQuantity?.toString() || "0",
        styles: { textColor: [220, 38, 38] } // red color for damaged
      },
      `(${currentCurrency.name}) ${prod.unitPrice || "0.00"}`,
      { 
        content: `(${currentCurrency.name}) ${prod.subTotal || "0.00"}`,
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
          'Quantity',
          'Damaged',
          'Unit Price',
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
        1: { cellWidth: 'auto' }, // Product
        2: { cellWidth: 'auto' }, // Brand
        3: { cellWidth: 'auto' }, // Quantity
        4: { cellWidth: 20 }, // Damaged
        5: { cellWidth: 'auto' }, // Unit Price
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
    const subtotal = purchase.totalAmount || 0;
    const vat = purchase.vat || 0;
    const previousDue = purchase.previousDue || 0;
    const paidAmount = purchase.totalPaymentAmount || 0;
    const dueAmount = purchase.dueAmount || 0;
    const totalOutstanding = previousDue + dueAmount;

    // Summary table
    const summaryData = [
      [
        { 
          content: `Subtotal:`, 
          styles: { fontStyle: 'bold' } 
        },
        { 
          content: `(${currentCurrency.name}) ${subtotal.toFixed(2)}`,
          styles: { halign: 'right' } 
        }
      ],
      [
        { content: `VAT:` },
        { 
          content: `(${currentCurrency.name}) ${vat}%`,
          styles: { halign: 'right' } 
        }
      ],
      [
        { content: `Previous Due:` },
        { 
          content: `(${currentCurrency.name}) ${previousDue.toFixed(2)}`,
          styles: { halign: 'right' } 
        }
      ],
      [
        { content: `Paid Amount:` },
        { 
          content: `(${currentCurrency.name}) ${paidAmount.toFixed(2)}`,
          styles: { halign: 'right' } 
        }
      ],
      [
        { content: `Current Due:` },
        { 
          content: `(${currentCurrency.name}) ${dueAmount.toFixed(2)}`,
          styles: { halign: 'right' } 
        }
      ],
      [
        { 
          content: `Total Outstanding:`, 
          styles: { fontStyle: 'bold' } 
        },
        { 
          content: `(${currentCurrency.name}) ${totalOutstanding.toFixed(2)}`,
          styles: { fontStyle: 'bold', halign: 'right' } 
        }
      ]
    ];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      body: summaryData as any,
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

    // Add signatures on the last page of each purchase
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

    // Add page break for multiple purchases (except the last one)
    if (purchaseIndex < selectedPurchaseData.length - 1) {
      doc.addPage();
    }
  });

  // Save the PDF
  const fileName = `purchase-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export default PdfPurchase;