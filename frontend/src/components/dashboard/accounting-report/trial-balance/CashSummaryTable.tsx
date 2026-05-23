import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type LedgerItem = {
  particularId: number;
  accountDescription: string;
  ledgerNo: string;
  group: string;
  debit: number;
  credit: number;
};

export type CashFlowData = {
  openingBalance: number;
  inflows: LedgerItem[];
  outflows: LedgerItem[];
  closingBalance: number;
  totals: {
    debit: number;
    credit: number;
  };
};

type Props = {
  data: CashFlowData;
};

const format = (num: number) =>
  num ? num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-";

export default function CashSummaryTable({ data }: Props) {
  let sl = 1;

  if (!data) return null;
console.log("trail balance Data",data)
  return (
    <div className="bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden max-w-5xl mx-auto">
      <Table>
        <TableHeader className="bg-primary-500 hover:bg-primary-600">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="text-white w-[60px] font-bold uppercase text-[11px]">SL</TableHead>
            <TableHead className="text-white font-bold uppercase text-[11px]">Account Description</TableHead>
            <TableHead className="text-white font-bold uppercase text-[11px]">Ledger no.</TableHead>
            <TableHead className="text-white text-right font-bold uppercase text-[11px]">Debit (Dr.)</TableHead>
            <TableHead className="text-white text-right font-bold uppercase text-[11px]">Credit (Cr.)</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="text-[13px]">
          {/* --- Opening Balance Section --- */}
          <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/80 transition-colors">
            <TableCell className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">00</TableCell>
            <TableCell className="font-bold text-emerald-900 uppercase text-[11px]">Opening Balance (Cash in Hand)</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right font-bold text-emerald-700">{format(data.openingBalance)}</TableCell>
            <TableCell className="text-right text-zinc-400">-</TableCell>
          </TableRow>

          {/* --- Inflows Section --- */}
          <TableRow className="bg-zinc-50 hover:bg-zinc-50 border-t-2 border-zinc-100">
            <TableCell colSpan={5} className="py-2 font-black text-zinc-400 uppercase text-[10px] tracking-[0.2em]">
              Inflows (Debit Items)
            </TableCell>
          </TableRow>
          {data.inflows.map((item) => (
            <TableRow key={item.particularId} className="hover:bg-zinc-50/30 transition-colors">
              <TableCell className="text-zinc-500 font-mono">{sl++}</TableCell>
              <TableCell className="font-medium text-zinc-700">{item.accountDescription}</TableCell>
              <TableCell className="text-zinc-400 font-mono text-xs">{item.ledgerNo}</TableCell>
              <TableCell className="text-right font-semibold text-zinc-900">{format(item.debit)}</TableCell>
              <TableCell className="text-right text-zinc-400">{format(item.credit)}</TableCell>
            </TableRow>
          ))}

          {/* --- Outflows Section --- */}
          <TableRow className="bg-zinc-50 hover:bg-zinc-50 border-t-2 border-zinc-100">
            <TableCell colSpan={5} className="py-2 font-black text-zinc-400 uppercase text-[10px] tracking-[0.2em]">
              Outflows (Credit Items)
            </TableCell>
          </TableRow>
          {data.outflows.map((item) => (
            <TableRow key={`out-${item.particularId}`} className="hover:bg-zinc-50/30 transition-colors">
              <TableCell className="text-zinc-500 font-mono">{sl++}</TableCell>
              <TableCell className="font-medium text-zinc-700">{item.accountDescription}</TableCell>
              <TableCell className="text-zinc-400 font-mono text-xs">{item.ledgerNo}</TableCell>
              <TableCell className="text-right text-zinc-400">{format(item.debit)}</TableCell>
              {/* <TableCell className="text-right font-semibold text-rose-600">{format(item.credit)}</TableCell> */}
              <TableCell className="text-right font-semibold ">{format(item.credit)}</TableCell>
            </TableRow>
          ))}

          {/* --- Closing Balance Section --- */}
          <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80 transition-colors border-t-2 border-zinc-200">
            <TableCell className="font-bold text-zinc-500 font-mono">{sl++}</TableCell>
            <TableCell className="font-bold text-zinc-800 uppercase text-[11px] italic">Closing Balance (Cash in Hand)</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right text-zinc-400">-</TableCell>
            <TableCell className="text-right font-bold text-rose-600 ">
              {format(data.closingBalance)}
            </TableCell>
          </TableRow>

          {/* --- Final Totals Footer --- */}
          <TableRow className="bg-zinc-900 text-white hover:bg-zinc-900 border-t-4 border-zinc-800">
            <TableCell></TableCell>
            <TableCell className="font-black uppercase tracking-tighter text-sm">Trial Balance Totals</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right font-black text-emerald-400 text-base">
              {format(data.totals.debit)}
            </TableCell>
            <TableCell className="text-right font-black text-emerald-400 text-base">
              {format(data.totals.credit)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}