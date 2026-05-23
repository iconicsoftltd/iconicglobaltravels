import Heading from "@/components/typography/Heading";
import { dateFormatter } from "@/utils/helper/dateFormatter";

export interface LedgerRow {
  date: string;
  voucherNo: number;
  description: string;
  debit: number;
  credit: number;
  balanceDebit: number;
  balanceCredit: number;
}

export interface LedgerSummary {
  totalDebit: number;
  totalCredit: number;
  totalBalanceDebit: number;
  totalBalanceCredit: number;
}

export interface LedgerReportResponse {
  rows: LedgerRow[];
  summary: LedgerSummary;
}

const CashInHandTable = ({ data, tableTitle }: { data: LedgerReportResponse, tableTitle: string }) => {
  return (
    <div>
      <Heading size="20" variant="secondary" className="p-4 bg-primary-500 text-white rounded-t-md">
        {tableTitle}
      </Heading>
      <table className="w-full min-w-[800px] border-collapse border border-slate-400 text-sm font-sans">
        <thead className="bg-primary-500 text-white">
          <tr>
            <th
              rowSpan={2}
              className="border border-slate-400 px-4 py-2 font-medium"
            >
              Date
            </th>
            <th
              rowSpan={2}
              className="border border-slate-400 px-4 py-2 font-medium"
            >
              description
            </th>
            <th
              rowSpan={2}
              className="border border-slate-400 px-2 py-2 font-medium"
            >
              V.N./J.N.
            </th>
            <th
              rowSpan={2}
              className="border border-slate-400 px-4 py-2 font-medium"
            >
              Debit
            </th>
            <th
              rowSpan={2}
              className="border border-slate-400 px-4 py-2 font-medium"
            >
              Credit
            </th>
            <th
              colSpan={2}
              className="border border-slate-400 px-4 py-1 font-medium text-center"
            >
              Balance
            </th>
          </tr>
          <tr className="">
            <th className="border border-slate-400 px-4 py-1 font-medium">
              Debit
            </th>
            <th className="border border-slate-400 px-4 py-1 font-medium">
              Credit
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.rows?.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border border-slate-400 px-4 py-1.5 text-center">
                {dateFormatter(row.date)}
              </td>
              <td className="border border-slate-400 px-4 py-1.5">
                {row.description}
              </td>
              <td className="border border-slate-400 px-4 py-1.5 text-right">
                {row.voucherNo}
              </td>
              <td className="border border-slate-400 px-4 py-1.5 text-right font-medium">
                {row.debit}
              </td>
              <td className="border border-slate-400 px-4 py-1.5 text-right font-medium">
                {row.credit}
              </td>
              <td className="border border-slate-400 px-4 py-1.5 text-right font-medium">
                {row.balanceDebit}
              </td>
              <td className="border border-slate-400 px-4 py-1.5 text-right">
                {row.balanceCredit}
              </td>
            </tr>
          ))}
          {/* Spacer Row */}
          <tr className="h-8">
            <td className="border border-slate-400"></td>
            <td className="border border-slate-400"></td>
            <td className="border border-slate-400"></td>
            <td className="border border-slate-400"></td>
            <td className="border border-slate-400"></td>
            <td className="border border-slate-400"></td>
            <td className="border border-slate-400"></td>
          </tr>
          {/* Red Balance Line Row */}
          <tr className="border-t-2">
            <td className="border border-slate-400 px-4 py-1.5 text-center font-bold italic">
              {/* 31/12/25 */}
            </td>
            <td className="border border-slate-400 px-4 py-1.5 font-medium">
              Balance c/d
            </td>
            <td className="border border-slate-400 px-4 py-1.5"></td>
            <td className="border border-slate-400 px-4 py-1.5"></td>
            <td className="border border-slate-400 px-4 py-1.5"></td>
            <td className="border border-slate-400 px-4 py-1.5 text-right font-bold">
              {data?.summary?.totalBalanceDebit}
            </td>
            <td className="border border-slate-400 px-4 py-1.5"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CashInHandTable;
