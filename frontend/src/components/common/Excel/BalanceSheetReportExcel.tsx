// Excel Export Component
import * as XLSX from "xlsx";

interface Ledger {
  name: string;
  balance: number;
}

interface Group {
  name: string;
  ledger: Ledger[];
}

interface Section {
  type: string;
  total: number;
  group: Group[];
}

interface BalanceSheetData {
  data: Section[];
  statics: {
    totalLiabilityAndEquity: number;
    suspenseAccount: number;
  };
}

interface BalanceSheetReportExcelProps {
  data: BalanceSheetData["data"];
  statics: {
    totalLiabilityAndEquity: number;
    suspenseAccount: number;
  };
}

const BalanceSheetReportExcel = ({
  data,
  statics,
}: BalanceSheetReportExcelProps) => {
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData: any[] = [];

    // Add header row
    excelData.push({
      "Type/Group/Balance Report": "BALANCE SHEET REPORT",
      Amount: "",
    });

    // Add date generated
    excelData.push({
      "Type/Group/Balance Report": `Generated on: ${new Date().toLocaleDateString()}`,
      Amount: "",
    });

    // Add empty row
    excelData.push({ "Type/Group/Balance Report": "", Amount: "" });

    data.forEach((section) => {
      // Section header
      excelData.push({
        "Type/Group/Balance Report": section.type,
        Amount: section.total || 0,
      });

      // Groups and ledgers
      section.group?.forEach((group) => {
        const groupTotal =
          group.ledger?.reduce((acc, l) => acc + (l.balance || 0), 0) || 0;

        // Group row
        excelData.push({
          "Type/Group/Balance Report": `  ${group.name}`,
          Amount: groupTotal,
        });

        // Ledger rows
        group.ledger?.forEach((ledger) => {
          excelData.push({
            "Type/Group/Balance Report": `    ${ledger.name}`,
            Amount: ledger.balance || 0,
          });
        });
      });

      // Add empty row between sections
      excelData.push({ "Type/Group/Balance Report": "", Amount: "" });
    });

    // Add statics section
    excelData.push({ "Type/Group/Balance Report": "SUMMARY", Amount: "" });
    excelData.push({
      "Type/Group/Balance Report": "Total Assets & Liabilities",
      Amount: statics?.totalLiabilityAndEquity || 0,
    });
    excelData.push({
      "Type/Group/Balance Report": "Total Suspense Account",
      Amount: statics?.suspenseAccount || 0,
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");

    // Auto-size columns
    const colWidths = [
      { wch: 50 }, // Type/Group/Balance Report column
      { wch: 20 }, // Amount column
    ];
    ws["!cols"] = colWidths;

    // Add some basic styling through cell styles
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:B1");

    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);

        if (!ws[cell_ref]) continue;

        // Style for headers
        if (R === 0) {
          ws[cell_ref].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: "center" },
          };
        }

        // Style for section headers
        else if (
          excelData[R]?.["Type/Group/Balance Report"] === excelData[R]?.Type &&
          (excelData[R]?.Type === "ASSETS" ||
            excelData[R]?.Type === "LIABILITIES" ||
            excelData[R]?.Type === "EQUITY")
        ) {
          ws[cell_ref].s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: "D3D3D3" } },
          };
        }

        // Style for group rows
        else if (
          excelData[R]?.["Type/Group/Balance Report"]?.startsWith("  ") &&
          !excelData[R]?.["Type/Group/Balance Report"]?.startsWith("    ")
        ) {
          ws[cell_ref].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "F0F0F0" } },
          };
        }

        // Style for summary section
        else if (
          excelData[R]?.["Type/Group/Balance Report"] === "SUMMARY" ||
          excelData[R]?.["Type/Group/Balance Report"] ===
            "Total Assets & Liabilities" ||
          excelData[R]?.["Type/Group/Balance Report"] ===
            "Total Suspense Account"
        ) {
          ws[cell_ref].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E8E8E8" } },
          };
        }

        // Format amount column as currency
        if (
          C === 1 &&
          ws[cell_ref].v !== "" &&
          typeof ws[cell_ref].v === "number"
        ) {
          ws[cell_ref].z = '#,##0.00" BDT"_);[Red](#,##0.00" BDT")';
        }
      }
    }

    // Export the file
    XLSX.writeFile(
      wb,
      `Balance-Sheet-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Auto-execute export when component is called
  exportToExcel();

  return null;
};

export default BalanceSheetReportExcel;
