import { useState } from "react";
import dayjs from "dayjs";
import ReportDateSelector from "@/utils/helper/ReportDateSelector";
import { useSelector } from "react-redux";
import { selectCurrentCurrency } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import { FaFilePdf, FaPrint } from "react-icons/fa6";
import Heading from "@/components/typography/Heading";
import { useGetTrialBalanceQuery } from "@/components/store/api/report/accountingReportApi";
import TrialBalanceReportPrint from "@/components/common/PrintPdf/TrialBalanceReportPrint";
import PdfTrialBalanceReport from "@/components/common/PrintPdf/PdfTrialBalanceReport";

const TrialBalanceReport = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [queryParams, setQueryParams] = useState({ fromDate, toDate });

  const currentCurrency = useSelector(selectCurrentCurrency);

  /* ===================== Search Handler ===================== */
  const handleSearch = ({ reportType, fromDate, toDate, month, year }) => {
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

    setQueryParams({ fromDate: _fromDate, toDate: _toDate });
    setShouldFetch(true);
  };

  /* ===================== API ===================== */
  const { data, isLoading } = useGetTrialBalanceQuery(
    { ...queryParams },
    {
      skip: !shouldFetch || !queryParams.fromDate || !queryParams.toDate,
    },
  );

  const reportData = data?.data;
  const reportList = reportData?.report || [];
  const grandTotal = reportData?.grandTotal;

  /* ===================== Print ===================== */
  const handlePrint = () => {
    if (!reportData) return;
    TrialBalanceReportPrint(
      reportData,
      currentCurrency,
      queryParams,
      reportType,
    );
  };

  /* ===================== PDF ===================== */
  const handleDownloadPdf = () => {
    if (!reportData) return;
    PdfTrialBalanceReport(reportData, currentCurrency, queryParams, reportType);
  };

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
          onSearch={handleSearch}
        />

        <div className="flex justify-end mt-4 gap-4">
          <Button onClick={handlePrint} disabled={!reportData}>
            <FaPrint /> Print
          </Button>
          <Button
            variant="red"
            onClick={handleDownloadPdf}
            disabled={!reportData}
          >
            <FaFilePdf /> PDF
          </Button>
        </div>
      </div>

      {/* ===================== Trial Balance Table ===================== */}
      {!isLoading && reportData && (
        <div className="border rounded-md max-h-[600px] overflow-auto bg-white">
          <table className="min-w-full border-collapse text-sm">
            {/* ================= HEADER ================= */}
            <thead className="bg-primary-500 sticky top-0 text-white">
              <tr>
                <th rowSpan={2} className="border px-4 py-2 text-left">
                  Particulars
                </th>
                <th colSpan={2} className="border px-4 py-2 text-center">
                  Opening Balance
                </th>
                <th colSpan={2} className="border px-4 py-2 text-center">
                  Transaction Details
                </th>
                <th colSpan={2} className="border px-4 py-2 text-center">
                  Closing
                </th>
              </tr>
              <tr>
                <th className="border px-2 py-2 text-right">Debit ({currentCurrency?.name})</th>
                <th className="border px-2 py-2 text-right">Credit ({currentCurrency?.name})</th>
                <th className="border px-2 py-2 text-right">Debit ({currentCurrency?.name})</th>
                <th className="border px-2 py-2 text-right">Credit ({currentCurrency?.name})</th>
                <th className="border px-2 py-2 text-right">Debit ({currentCurrency?.name})</th>
                <th className="border px-2 py-2 text-right">Credit ({currentCurrency?.name})</th>
              </tr>
            </thead>

            {/* ================= BODY ================= */}
            <tbody>
              {reportList.map((group, gIndex) => {
                const groupTotal = group.ledger.reduce(
                  (acc, l) => {
                    acc.openingDebit += l.subtotal.openingDebit;
                    acc.openingCredit += l.subtotal.openingCredit;
                    acc.trxDebit += l.subtotal.trxDebit;
                    acc.trxCredit += l.subtotal.trxCredit;
                    acc.closingDebit += l.subtotal.closingDebit;
                    acc.closingCredit += l.subtotal.closingCredit;
                    return acc;
                  },
                  {
                    openingDebit: 0,
                    openingCredit: 0,
                    trxDebit: 0,
                    trxCredit: 0,
                    closingDebit: 0,
                    closingCredit: 0,
                  },
                );

                return (
                  <>
                    {/* ===== Group Name ===== */}
                    <tr
                      key={`group-${gIndex}`}
                      className="bg-gray-200 font-semibold"
                    >
                      <td colSpan={7} className="border px-4 py-2">
                        {group.groupName}
                      </td>
                    </tr>

                    {group.ledger.map((ledger, lIndex) => (
                      <>
                        {/* ===== Ledger Name ===== */}
                        <tr
                          key={`ledger-${gIndex}-${lIndex}`}
                          className="bg-gray-50 font-medium"
                        >
                          <td colSpan={7} className="border px-6 py-2">
                            {ledger.ledgerName}
                          </td>
                        </tr>

                        {/* ===== Particular Rows ===== */}
                        {ledger.particular.length > 0 ? (
                          ledger.particular.map((p, pIndex) => (
                            <tr key={`p-${pIndex}`}>
                              <td className="border px-10 py-2">
                                {p.particularName || "—"}
                              </td>
                              <td className="border px-2 py-2 text-right">
                                {p.openingDebit.toLocaleString()}
                              </td>
                              <td className="border px-2 py-2 text-right">
                                {p.openingCredit.toLocaleString()}
                              </td>
                              <td className="border px-2 py-2 text-right">
                                {p.trxDebit.toLocaleString()}
                              </td>
                              <td className="border px-2 py-2 text-right">
                                {p.trxCredit.toLocaleString()}
                              </td>
                              <td className="border px-2 py-2 text-right">
                                {p.closingDebit.toLocaleString()}
                              </td>
                              <td className="border px-2 py-2 text-right">
                                {p.closingCredit.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="border px-10 py-2 italic text-gray-500">
                              No transactions
                            </td>
                            <td colSpan={6} className="border" />
                          </tr>
                        )}

                        {/* ===== Ledger Subtotal ===== */}
                        <tr className="font-semibold">
                          <td className="border px-6 py-2 text-right">
                            Sub Total
                          </td>
                          <td className="border px-2 py-2 text-right">
                            {ledger.subtotal.openingDebit.toLocaleString()}
                          </td>
                          <td className="border px-2 py-2 text-right">
                            {ledger.subtotal.openingCredit.toLocaleString()}
                          </td>
                          <td className="border px-2 py-2 text-right">
                            {ledger.subtotal.trxDebit.toLocaleString()}
                          </td>
                          <td className="border px-2 py-2 text-right">
                            {ledger.subtotal.trxCredit.toLocaleString()}
                          </td>
                          <td className="border px-2 py-2 text-right">
                            {ledger.subtotal.closingDebit.toLocaleString()}
                          </td>
                          <td className="border px-2 py-2 text-right">
                            {ledger.subtotal.closingCredit.toLocaleString()}
                          </td>
                        </tr>
                      </>
                    ))}

                    {/* ===== Group Sub Total ===== */}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border px-4 py-2 text-right">
                        Total Amount
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {groupTotal.openingDebit.toLocaleString()}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {groupTotal.openingCredit.toLocaleString()}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {groupTotal.trxDebit.toLocaleString()}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {groupTotal.trxCredit.toLocaleString()}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {groupTotal.closingDebit.toLocaleString()}
                      </td>
                      <td className="border px-2 py-2 text-right">
                        {groupTotal.closingCredit.toLocaleString()}
                      </td>
                    </tr>
                  </>
                );
              })}

              {/* ================= GRAND TOTAL ================= */}
              <tr className="bg-gray-300 font-bold">
                <td className="border px-4 py-3 text-right">
                  Grand Total Amount
                </td>
                <td className="border px-2 py-3 text-right">
                  {grandTotal.openingDebit.toLocaleString()}
                </td>
                <td className="border px-2 py-3 text-right">
                  {grandTotal.openingCredit.toLocaleString()}
                </td>
                <td className="border px-2 py-3 text-right">
                  {grandTotal.trxDebit.toLocaleString()}
                </td>
                <td className="border px-2 py-3 text-right">
                  {grandTotal.trxCredit.toLocaleString()}
                </td>
                <td className="border px-2 py-3 text-right">
                  {grandTotal.closingDebit.toLocaleString()}
                </td>
                <td className="border px-2 py-3 text-right">
                  {grandTotal.closingCredit.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrialBalanceReport;
