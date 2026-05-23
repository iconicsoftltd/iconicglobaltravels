import LedgerReportPrint from "@/components/common/PrintPdf/LedgerReportPrint";
import PdfLedgerReport from "@/components/common/PrintPdf/PdfLedgerReport";
import LedgerTable from "@/components/dashboard/accounting-report/ledger/LedgerTable";
import HomeLoader from "@/components/loader/HomeLoader";
import { useGetLedgerReportQuery } from "@/components/store/api/report/accountingReportApi";
import { selectCurrentCurrency } from "@/components/store/store";
import Heading from "@/components/typography/Heading";
import { Button } from "@/components/ui/button";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import dayjs from "dayjs";
import { useState } from "react";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { ParticularAccountType } from "../accounting/PerticularAccountList";

interface Balance {
  balance: number;
  balanceType: "Dr" | "Cr";
  date: string;
}

interface Transaction {
  date: string;
  voucherNo: string;
  voucherType: string;
  description: string;
  oppositeAccount: string | null;
  debit: number;
  credit: number;
  balance: number;
  balanceType: "Dr" | "Cr";
}

export interface LedgerData {
  accountName: string;
  openingBalance: Balance;
  transactions: Transaction[];
  summary: {
    totalDebit: number;
    totalCredit: number;
    closingBalance: Balance;
  };
}

export default function LedgerReportPage() {
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // const [queryParams, setQueryParams] = useState({ fromDate, toDate });
  const [particular, setParticular] = useState<
    ParticularAccountType | undefined
  >(undefined);
  const [queryParams, setQueryParams] = useState<{
    fromDate: string;
    toDate: string;
    particularId?: number; // ✅ ADD
  }>({ fromDate, toDate });

  const { data, isLoading, isError } = useGetLedgerReportQuery(queryParams);

  const currentCurrency = useSelector(selectCurrentCurrency);

  /* ===================== Search Handler ===================== */
  const handleSearch = ({
    reportType,
    fromDate,
    toDate,
    month,
    year,
    particular,
  }: {
    reportType: string;
    fromDate: string;
    toDate: string;
    month: string;
    year: string;
    particular?: ParticularAccountType | undefined;
  }) => {
    let _fromDate = "";
    let _toDate = "";

    if (reportType === "daily") {
      if (!fromDate || !toDate) return;
      _fromDate = dayjs(fromDate).format("YYYY-MM-DD");
      _toDate = dayjs(toDate).format("YYYY-MM-DD");
    } else if (reportType === "monthly") {
      if (!month || !year) return;
      _fromDate = dayjs(`${year}-${month}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      _toDate = dayjs(`${year}-${month}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
    } else if (reportType === "yearly") {
      if (!year) return;
      _fromDate = `${year}-01-01`;
      _toDate = `${year}-12-31`;
    }

    setQueryParams({
      fromDate: _fromDate,
      toDate: _toDate,
      ...(particular?.id && { particularId: particular.id,  particularName: particular.accountType }), // ✅ ADD
    });
  };

  // Example API data
  const ledgerData: LedgerData[] = data?.data || [];

  const handlePrint = () => {
    if (!ledgerData) return;
    LedgerReportPrint(ledgerData, currentCurrency, queryParams, reportType);
  };

  /* ===================== PDF ===================== */
  const handleDownloadPdf = () => {
    if (!ledgerData) return;
    PdfLedgerReport(ledgerData, currentCurrency, queryParams, reportType);
  };

  if (isLoading) {
    return <HomeLoader />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error fetching ledger data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ===================== Filters ===================== */}
      <div className="border p-4 rounded-md bg-white">
        <Heading className="mb-4">Ledger Report</Heading>

        <ReportDateSelector
          reportType={reportType}
          setReportType={setReportType}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          showParticular={true} // ✅ ADD
          particular={particular} // ✅ ADD
          setParticular={setParticular} // ✅ ADD
          onSearch={handleSearch}
        />

        <div className="flex justify-end mt-4 gap-4">
          <Button onClick={handlePrint} disabled={!ledgerData}>
            <FaPrint /> Print
          </Button>
          <Button
            variant="red"
            onClick={handleDownloadPdf}
            disabled={!ledgerData}
          >
            <FaFilePdf /> PDF
          </Button>
        </div>
      </div>

      {/* Report */}
      <div className="space-y-10">
        {ledgerData.map((account, i) => (
          <LedgerTable key={i} account={account} />
        ))}
      </div>
    </div>
  );
}
