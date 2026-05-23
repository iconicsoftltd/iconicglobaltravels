import { LedgerData } from "@/pages/dashboard/acountingReport/LedgerReportPage";
import { toFixedAmount } from "@/utils/formatter";
import dayjs from "dayjs";
// Import the common helper

export default function LedgerTable({ account }: { account: LedgerData }) {
  console.log("account data",account)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      {/* Account Title Header */}
      <div className="bg-zinc-100 px-6 py-4 flex justify-between items-center">
        <h3 className="font-bold text-lg tracking-tight">
          {account.accountName}
        </h3>
        <span className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">
          General Ledger
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* Header */}
          <thead className="bg-primary-400 text-white border-b border-zinc-200">
            <tr>
              <th rowSpan={2} className="border-r border-zinc-200 px-4 py-3 text-left font-semibold uppercase text-[11px]">Date</th>
              <th rowSpan={2} className="border-r border-zinc-200 px-4 py-3 text-left font-semibold uppercase text-[11px]">Particulars</th>
              <th rowSpan={2} className="border-r border-zinc-200 px-4 py-3 text-left font-semibold uppercase text-[11px]">Notes</th>
              <th rowSpan={2} className="border-r border-zinc-200 px-4 py-3 text-center font-semibold uppercase text-[11px] w-24">V.N / J.N</th>
              <th rowSpan={2} className="border-r border-zinc-200 px-4 py-3 text-right font-semibold uppercase text-[11px]">Debit</th>
              <th rowSpan={2} className="border-r border-zinc-200 px-4 py-3 text-right font-semibold uppercase text-[11px]">Credit</th>
              <th colSpan={2} className="px-4 py-2 text-center font-bold uppercase text-[11px] bg-primary-400 border">Running Balance</th>
            </tr>
            <tr className="bg-primary-400">
              <th className="border-r border-zinc-200 px-4 py-2 text-right font-semibold text-[10px]">Debit</th>
              <th className="px-4 py-2 text-right font-semibold text-[10px]">Credit</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100">
            {/* Opening Balance */}
            {account.openingBalance.balance !== 0 && (
              <tr className="bg-emerald-50/30">
                <td className="px-4 py-3 text-zinc-500 italic">
                  {dayjs(account.openingBalance.date).format("DD/MM/YY")}
                </td>
                <td className="px-4 py-3 font-bold text-zinc-800 uppercase text-xs">Opening Balance (b/d)</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right font-bold text-zinc-700">
                  {account.openingBalance.balanceType === "Dr" ? toFixedAmount(account.openingBalance.balance) : ""}
                </td>
                <td className="px-4 py-3 text-right font-bold text-zinc-700">
                  {account.openingBalance.balanceType === "Cr" ? toFixedAmount(account.openingBalance.balance) : ""}
                </td>
              </tr>
            )}

            {/* Transactions */}
            {account.transactions.map((trx, i) => (
              <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-4 py-3 text-zinc-500">
                  {dayjs(trx.date).format("DD/MM/YY")}
                </td>
                <td className="px-4 py-3 text-zinc-700">{trx.oppositeAccount}</td>
                <td className="px-4 py-3 text-zinc-700">{trx.description}</td>
                <td className="px-4 py-3 text-center text-zinc-500 font-mono text-xs">{trx.voucherNo}</td>
                {/* <td className="px-4 py-3 text-right font-medium text-rose-600"> */}
                <td className="px-4 py-3 text-right font-medium">
                  {trx.debit > 0 ? toFixedAmount(trx.debit) : ""}
                </td>
                {/* <td className="px-4 py-3 text-right font-medium text-emerald-600"> */}
                <td className="px-4 py-3 text-right font-medium ">
                  {trx.credit > 0 ? toFixedAmount(trx.credit) : ""}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-600">
                  {trx.balanceType === "Dr" ? toFixedAmount(trx.balance) : ""}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-600">
                  {trx.balanceType === "Cr" ? toFixedAmount(trx.balance) : ""}
                </td>
              </tr>
            ))}

            {/* Closing Balance Footer */}
            <tr className="bg-zinc-100">
              <td className="px-4 py-4 font-medium italic opacity-70">
                {dayjs(account.summary.closingBalance.date).format("DD/MM/YY")}
              </td>
              <td className="px-4 py-4 font-bold uppercase tracking-wider text-xs">Closing Balance (c/d)</td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4"></td>
              {/* <td className="px-4 py-4 text-right font-bold text-rose-400 border-t border-white/20"> */}
              <td className="px-4 py-4 text-right font-bold  border-t border-white/20">
                {toFixedAmount(account.summary.totalDebit)}
              </td>
              {/* <td className="px-4 py-4 text-right font-bold text-emerald-400 border-t border-white/20"> */}
              <td className="px-4 py-4 text-right font-bold  border-t border-white/20">
                {toFixedAmount(account.summary.totalCredit)}
              </td>
              <td className="px-4 py-4 text-right font-black text-primary-400 text-sm">
                {account.summary.closingBalance.balanceType === "Dr" ? toFixedAmount(account.summary.closingBalance.balance) : ""}
              </td>
              <td className="px-4 py-4 text-right font-black text-primary-400 text-sm">
                {account.summary.closingBalance.balanceType === "Cr" ? toFixedAmount(account.summary.closingBalance.balance) : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}