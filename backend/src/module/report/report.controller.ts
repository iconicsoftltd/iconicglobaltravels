import { Account, Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prisma from "../../utils/prisma";
interface Chart {
  type: Account;
  group: {
    name: string;
    ledger: {
      name: string;
      particular: {
        name: string;
      }[];
    }[];
  }[];
}
export const chartOfAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { branchId } = req.query;
    if (!branchId)
      return res
        .status(400)
        .json({ success: false, message: "Branch id is required" });

    let report: Chart[] = [];
    const findGroup = await prisma.group.findMany({
      where: {
        branchId: Number(branchId),
      },
      include: {
        Ledger: {
          include: {
            particulars: true,
          },
        },
      },
    });
    for (const group of findGroup) {
      const findAccount = report.find((acc) => acc.type === group.account);
      if (findAccount) {
        const findGroup = findAccount.group.find(
          (grp) => grp.name === group.accountType,
        );
        if (findGroup) {
          findGroup.ledger.push(
            ...group.Ledger.map((ledger) => ({
              name: `${ledger.ledgerType} (${ledger.id})`,
              particular: ledger.particulars.map((particular) => ({
                name: `${particular.accountType} (${particular.id})`,
              })),
            })),
          );
        } else {
          findAccount.group.push({
            name: group.accountType,
            ledger: group.Ledger.map((ledger) => ({
              name: `${ledger.ledgerType} (${ledger.id})`,
              particular: ledger.particulars.map((particular) => ({
                name: `${particular.accountType} (${particular.id})`,
              })),
            })),
          });
        }
      } else {
        report.push({
          type: group.account,
          group: [
            {
              name: group.accountType,
              ledger: group.Ledger.map((ledger) => ({
                name: `${ledger.ledgerType} (${ledger.id})`,
                particular: ledger.particulars.map((particular) => ({
                  name: `${particular.accountType} (${particular.id})`,
                })),
              })),
            },
          ],
        });
      }
    }
    res.status(200).json({
      success: true,
      message: "Chart of accounts",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
export const balanceSheet = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { branchId } = req.query;
    if (!branchId)
      return res
        .status(400)
        .json({ success: false, message: "Branch id is required" });
    interface Chart {
      type: Account;
      group: {
        name: string;
        ledger: {
          name: string;
          balance: number;
        }[];
      }[];
      total: number;
    }
    let report: Chart[] = [];
    const findGroup = await prisma.group.findMany({
      where: {
        account: {
          in: ["Assets", "Liability", "Equity"],
        },
        branchId: Number(branchId),
      },
      include: {
        Ledger: {
          include: {
            particulars: true,
          },
        },
      },
    });
    for (const group of findGroup) {
      const findAccount = report.find((acc) => acc.type === group.account);
      if (findAccount) {
        const findGroup = findAccount.group.find(
          (grp) => grp.name === group.accountType,
        );
        if (findGroup) {
          findGroup.ledger.push(
            ...group.Ledger.map((ledger) => ({
              name: `${ledger.ledgerType} (${ledger.id})`,
              balance: ledger.balance,
            })),
          );
        } else {
          findAccount.group.push({
            name: group.accountType,
            ledger: group.Ledger.map((ledger) => ({
              name: `${ledger.ledgerType} (${ledger.id})`,
              balance: ledger.balance,
            })),
          });
        }
      } else {
        report.push({
          type: group.account,
          group: [
            {
              name: group.accountType,
              ledger: group.Ledger.map((ledger) => ({
                name: `${ledger.ledgerType} (${ledger.id})`,
                balance: ledger.balance,
              })),
            },
          ],
          total: 0,
        });
      }
    }

    for (const acc of report) {
      for (const grp of acc.group) {
        for (const ledger of grp.ledger) {
          acc.total += ledger.balance;
        }
      }
    }

    const totalAssets = report.find((acc) => acc.type === "Assets");
    const totalLiabilities = report.find((acc) => acc.type === "Liability");
    const totalEquity = report.find((acc) => acc.type === "Equity");
    const totalLiabilityAndEquity =
      (totalLiabilities?.total || 0) + (totalEquity?.total || 0);
    res.status(200).json({
      success: true,
      message: "Balance sheet report",
      statics: {
        totalLiabilityAndEquity,
        suspenseAccount: (totalAssets?.total || 0) - totalLiabilityAndEquity,
      },
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

export const incomeReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, message: "From date and to date is required" });
    }

    const startDate = new Date(fromDate?.toString() || new Date());
    const endDate = new Date(toDate?.toString() || new Date());
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          date: { gte: startDate, lte: endDate },
          branchId: Number(branchId),
        },
        particular: {
          ledger: {
            group: {
              account: { in: ["Income", "Expense"] },
            },
          },
        },
      },
      include: {
        particular: {
          select: {
            ledger: {
              select: {
                ledgerType: true,
                group: { select: { account: true } },
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalExpense = 0;
    interface Income {
      account: string;
      classification: string;
      amount: number;
    }
    interface Expense {
      account: string;
      classification: string;
      amount: number;
    }
    const revenue: Income[] = [];
    const expense: Expense[] = [];

    for (const entry of entries) {
      const { account } = entry.particular.ledger.group;
      const ledgerType = entry.particular.ledger.ledgerType;

      if (account === "Income") {
        const amount = entry.type === "Credit" ? entry.amount : -entry.amount;
        totalRevenue += amount;
        const existing = revenue.find((r) => r.account === ledgerType);
        if (existing) existing.amount += amount;
        else
          revenue.push({
            account: ledgerType,
            classification: "Income",
            amount,
          });
      } else if (account === "Expense") {
        const amount = entry.type === "Debit" ? entry.amount : -entry.amount;
        totalExpense += amount;
        const existing = expense.find((e) => e.account === ledgerType);
        if (existing) existing.amount += amount;
        else
          expense.push({
            account: ledgerType,
            classification: "Expense",
            amount,
          });
      }
    }

    const netIncome = totalRevenue - totalExpense;

    res.status(200).json({
      success: true,
      message: "Income and Expense Report",
      data: {
        startDate,
        endDate,
        totalRevenue,
        totalExpense,
        netIncome: netIncome,
        revenue,
        expense,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const ownerSecurityReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, message: "From date and to date is required" });
    }

    const startDate = new Date(fromDate?.toString() || new Date());
    const endDate = new Date(toDate?.toString() || new Date());
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          date: { gte: startDate, lte: endDate },
          branchId: Number(branchId),
        },
        particular: {
          ledger: {
            group: {
              account: { in: ["Income", "Expense", "Equity"] },
            },
          },
        },
      },
      include: {
        particular: {
          select: {
            ledger: {
              select: {
                ledgerType: true,
                group: { select: { account: true } },
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalExpense = 0;
    let totalEquity = 0;
    interface report {
      account: string;
      classification: string;
      amount: number;
    }

    const revenue: report[] = [];
    const expense: report[] = [];
    const addEquity: report[] = [];
    const lessEquity: report[] = [];

    for (const entry of entries) {
      const { account } = entry.particular.ledger.group;
      const ledgerType = entry.particular.ledger.ledgerType;

      if (account === "Income") {
        const amount = entry.type === "Credit" ? entry.amount : -entry.amount;
        totalRevenue += amount;
        const existing = revenue.find((r) => r.account === ledgerType);
        if (existing) existing.amount += amount;
        else
          revenue.push({
            account: ledgerType,
            classification: "Income",
            amount,
          });
      } else if (account === "Expense") {
        const amount = entry.type === "Debit" ? entry.amount : -entry.amount;
        totalExpense += amount;
        const existing = expense.find((e) => e.account === ledgerType);
        if (existing) existing.amount += amount;
        else
          expense.push({
            account: ledgerType,
            classification: "Expense",
            amount,
          });
      } else if (account === "Equity") {
        const amount = entry.type === "Credit" ? entry.amount : -entry.amount;
        totalEquity += amount;
        if (entry.type === "Credit")
          addEquity.push({
            account: ledgerType,
            classification: "Capital Investment",
            amount,
          });
        else
          lessEquity.push({
            account: ledgerType,
            classification: "Owner's Withdrawal",
            amount: -amount,
          });
      }
    }

    const netIncome = totalRevenue - totalExpense;
    const endingCapital = netIncome + totalEquity;

    res.status(200).json({
      success: true,
      message: "Income and Expense Report",
      data: {
        startDate,
        endDate,
        addEquity,
        netIncome: netIncome,
        lessEquity,
        endingCapital,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const balanceSheets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, message: "From date and to date is required" });
    }

    const startDate = new Date(fromDate?.toString() || new Date());
    const endDate = new Date(toDate?.toString() || new Date());
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          date: { gte: startDate, lte: endDate },
          branchId: Number(branchId),
        },
        particular: {
          ledger: {
            group: {
              account: {
                in: ["Income", "Expense", "Equity", "Assets", "Liability"],
              },
            },
          },
        },
      },
      include: {
        particular: {
          select: {
            ledger: {
              select: {
                ledgerType: true,
                group: { select: { account: true, accountType: true } },
              },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalExpense = 0;
    let totalEquity = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;
    interface report {
      account: string;
      classification: string;
      amount: number;
    }

    type ass = {
      groupName: string;
      account: report[];
      totalAmount: number;
    };

    const revenue: report[] = [];
    const expense: report[] = [];
    const addEquity: report[] = [];
    const lessEquity: report[] = [];
    const assets: ass[] = [];
    const liabilities: ass[] = [];

    for (const entry of entries) {
      const { account } = entry.particular.ledger.group;
      const ledgerType = entry.particular.ledger.ledgerType;

      if (account === "Income") {
        const amount = entry.type === "Credit" ? entry.amount : -entry.amount;
        totalRevenue += amount;
        const existing = revenue.find((r) => r.account === ledgerType);
        if (existing) existing.amount += amount;
        else
          revenue.push({
            account: ledgerType,
            classification: "Income",
            amount,
          });
      } else if (account === "Expense") {
        const amount = entry.type === "Debit" ? entry.amount : -entry.amount;
        totalExpense += amount;
        const existing = expense.find((e) => e.account === ledgerType);
        if (existing) existing.amount += amount;
        else
          expense.push({
            account: ledgerType,
            classification: "Expense",
            amount,
          });
      } else if (account === "Equity") {
        const amount = entry.type === "Credit" ? entry.amount : -entry.amount;
        totalEquity += amount;
        if (entry.type === "Credit")
          addEquity.push({
            account: ledgerType,
            classification: "Capital Investment",
            amount,
          });
        else
          lessEquity.push({
            account: ledgerType,
            classification: "Owner's Withdrawal",
            amount: -amount,
          });
      } else if (account === "Assets") {
        const amount = entry.type === "Debit" ? entry.amount : -entry.amount;
        totalAssets += amount;
        const existing = assets.find(
          (e) => e.groupName === entry.particular.ledger.group.accountType,
        );
        if (existing) {
          existing.totalAmount += amount;
          const findAccount = existing.account.find(
            (a) => a.account === ledgerType,
          );
          if (findAccount) findAccount.amount += amount;
          else
            existing.account.push({
              account: ledgerType,
              classification: "Assets",
              amount,
            });
        } else
          assets.push({
            groupName: entry.particular.ledger.group.accountType,
            account: [
              { account: ledgerType, classification: "Assets", amount },
            ],
            totalAmount: amount,
          });
      } else if (account === "Liability") {
        const amount = entry.type === "Credit" ? entry.amount : -entry.amount;

        totalLiabilities += amount;

        const existing = liabilities.find(
          (e) => e.groupName === entry.particular.ledger.group.accountType,
        );

        if (existing) {
          existing.totalAmount += amount;

          const findAccount = existing.account.find(
            (a) => a.account === ledgerType,
          );

          if (findAccount) {
            findAccount.amount += amount;
          } else {
            existing.account.push({
              account: ledgerType,
              classification: "Liabilities",
              amount,
            });
          }
        } else {
          liabilities.push({
            groupName: entry.particular.ledger.group.accountType,
            account: [
              {
                account: ledgerType,
                classification: "Liabilities",
                amount,
              },
            ],
            totalAmount: amount,
          });
        }
      }
    }

    const netIncome = totalRevenue - totalExpense;
    const endingCapital = netIncome + totalEquity;

    res.status(200).json({
      success: true,
      message: "Income and Expense Report",
      data: {
        startDate,
        endDate,
        assets,
        totalAssets,
        liabilities,
        totalLiabilities,
        ownerSecurity: endingCapital,
        totalLiabilitiesAndEquity: totalLiabilities + endingCapital,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const dashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    if (!branchId) {
      return res
        .status(400)
        .json({ success: false, message: "Branch ID is required" });
    }
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, message: "From date and to date is required" });
    }

    const startDate = new Date(fromDate?.toString() || new Date());
    const endDate = new Date(toDate?.toString() || new Date());
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalCredit = await prisma.particularOnVoucher.aggregate({
      where: {
        type: "Credit",
        particular: {
          ledger: {
            ledgerType: {
              in: ["Cash In Hand", "Cash At Bank"],
            },
          },
        },
        voucher: {
          date: { gte: startDate, lte: endDate },
          branchId: Number(branchId),
        },
      },
      _sum: {
        amount: true,
      },
    });
    const totalDebit = await prisma.particularOnVoucher.aggregate({
      where: {
        type: "Debit",
        particular: {
          ledger: {
            ledgerType: {
              in: ["Cash In Hand", "Cash At Bank"],
            },
          },
        },
        voucher: {
          date: { gte: startDate, lte: endDate },
          branchId: Number(branchId),
        },
      },
      _sum: {
        amount: true,
      },
    });
    const totalCOGS = await prisma.particularOnVoucher.aggregate({
      where: {
        type: "Debit",
        particular: {
          ledger: {
            ledgerType: "COGS",
          },
        },
        voucher: {
          date: { gte: startDate, lte: endDate },
          branchId: Number(branchId),
        },
      },
      _sum: {
        amount: true,
      },
    });
    const totalExpense = await prisma.particularOnVoucher.aggregate({
      where: {
        type: "Debit",
        particular: {
          ledger: {
            ledgerType: {
              not: "COGS",
            },
            group: {
              account: "Expense",
            },
          },
        },
        voucher: {
          date: { gte: startDate, lte: endDate },
          branchId: Number(branchId),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalSales = await prisma.sale.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
        branchId: Number(branchId),
      },
      _sum: {
        totalAmount: true,
      },
    });
    const totalPurchase = await prisma.purchase.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
        branchId: Number(branchId),
      },
      _sum: {
        totalAmount: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Income and Expense Report",
      data: {
        totalSales: totalSales._sum.totalAmount || 0,
        totalCOGS: totalCOGS._sum.amount || 0,
        totalPurchase: totalPurchase._sum.totalAmount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        totalCredit: totalCredit._sum.amount || 0,
        totalDebit: totalDebit._sum.amount || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export interface VoucherLedgerParams {
  fromDate: string;
  toDate: string;
  particularId: number;
  branchId: number;
}

export interface VoucherLedgerRow {
  date: string;
  invoice: string;
  details: string | null;
  debit: number;
  credit: number;
}

export async function getVoucherLedgerReport(params: VoucherLedgerParams) {
  const { fromDate, toDate, particularId, branchId } = params;

  const vouchers = await prisma.voucher.findMany({
    where: {
      branchId,
      date: {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      },
      particulars: {
        some: {
          particularId,
        },
      },
    },
    include: {
      particulars: {
        where: { particularId },
        select: {
          amount: true,
          type: true, // BalanceType (Debit | Credit)
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Now formatting the report rows
  const rows: VoucherLedgerRow[] = vouchers.map((v) => {
    let debit = 0;
    let credit = 0;

    v.particulars.forEach((p) => {
      if (p.type === "Debit") debit += p.amount;
      else credit += p.amount;
    });

    return {
      date: v.date.toISOString().split("T")[0],
      invoice: v.voucherNo,
      details: v.narration ?? "",
      debit,
      credit,
    };
  });

  // Calculate totals
  const totals = rows.reduce(
    (acc, row) => {
      acc.totalDebit += row.debit;
      acc.totalCredit += row.credit;
      return acc;
    },
    { totalDebit: 0, totalCredit: 0 },
  );

  return {
    rows,
    totals,
    balance: Math.abs(totals.totalCredit - totals.totalDebit),
  };
}

export interface GeneralLedgerParams {
  fromDate: string;
  toDate: string;
  particularId: number;
  branchId: number;
}

export interface LedgerRow {
  date: string;
  details: string;
  narration: string | null;
  debit: number;
  credit: number;
}

export async function getGeneralLedgerReport(params: GeneralLedgerParams) {
  const { fromDate, toDate, particularId, branchId } = params;

  // 1️⃣ Fetch Opening Balance
  const particular = await prisma.particular.findFirst({
    where: { id: particularId, branchId },
    select: {
      openingBalance: true,
      openingBalanceType: true,
    },
  });

  const openingBalanceRow: LedgerRow = {
    date: fromDate,
    details: "",
    narration: "Opening Balance",
    debit:
      particular?.openingBalanceType === "Debit"
        ? particular.openingBalance
        : 0,
    credit:
      particular?.openingBalanceType === "Credit"
        ? particular.openingBalance
        : 0,
  };

  // 2️⃣ Fetch All Ledger Transactions
  const vouchers = await prisma.voucher.findMany({
    where: {
      branchId,
      date: {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      },
      particulars: {
        some: {
          particularId,
        },
      },
    },
    include: {
      particulars: {
        where: { particularId },
        select: {
          amount: true,
          type: true, // Debit | Credit
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const rows: LedgerRow[] = vouchers.map((v) => {
    let debit = 0;
    let credit = 0;

    v.particulars.forEach((p) => {
      if (p.type === "Debit") debit += p.amount;
      else credit += p.amount;
    });

    return {
      date: v.date.toISOString().split("T")[0],
      details: voucherTypeName(v.type), // readable type
      narration: v.narration ?? "",
      debit,
      credit,
    };
  });

  // 3️⃣ Combine Opening + All Rows
  const finalRows = [openingBalanceRow, ...rows];

  // 4️⃣ Calculate Totals
  const totals = finalRows.reduce(
    (acc, row) => {
      acc.totalDebit += row.debit;
      acc.totalCredit += row.credit;
      return acc;
    },
    { totalDebit: 0, totalCredit: 0 },
  );

  const balance = totals.totalDebit - totals.totalCredit;

  return {
    rows: finalRows,
    totals,
    balance,
  };
}

// Helper: Convert VoucherType enum into readable labels
function voucherTypeName(type: string): string {
  switch (type) {
    case "PAYMENT":
      return "Payment Voucher";
    case "RECEIPT":
      return "Receive Voucher";
    case "SALES":
      return "Sales";
    case "SERVICE_SALES":
      return "Service Sales";
    case "SALES_RETURN":
      return "Sales Return";
    case "PURCHASE":
      return "Purchase";
    case "PURCHASE_RETURN":
      return "Purchase Return";
    case "JOURNAL":
      return "Journal Voucher";
    default:
      return type;
  }
}

export interface TrialBalanceParams {
  fromDate: string;
  toDate: string;
  branchId: number;
}

export interface TrialBalance {
  groupName: string;
  ledger: {
    ledgerName: string;
    particular: {
      particularName: string;
      openingDebit: number;
      openingCredit: number;
      trxDebit: number;
      trxCredit: number;
      closingDebit: number;
      closingCredit: number;
    }[];
    subtotal: {
      openingDebit: number;
      openingCredit: number;
      trxDebit: number;
      trxCredit: number;
      closingDebit: number;
      closingCredit: number;
    };
  }[];
}

export interface TrialBalanceResult {
  report: TrialBalance[];
  grandTotal: {
    openingDebit: number;
    openingCredit: number;
    trxDebit: number;
    trxCredit: number;
    closingDebit: number;
    closingCredit: number;
  };
}

export async function getTrialBalanceReport(
  params: TrialBalanceParams,
): Promise<TrialBalanceResult> {
  const { fromDate, toDate, branchId } = params;

  const groups = await prisma.group.findMany({
    where: { branchId },
    include: {
      Ledger: {
        include: { particulars: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const report: TrialBalance[] = [];

  // GRAND TOTAL ACCUMULATOR
  const grandTotal = {
    openingDebit: 0,
    openingCredit: 0,
    trxDebit: 0,
    trxCredit: 0,
    closingDebit: 0,
    closingCredit: 0,
  };

  for (const group of groups) {
    const groupData = {
      groupName: group.accountType,
      ledger: [] as TrialBalance["ledger"],
    };

    for (const ledger of group.Ledger) {
      const ledgerRow = {
        ledgerName: ledger.ledgerType,
        particular: [] as TrialBalance["ledger"][0]["particular"],
        subtotal: {
          openingDebit: 0,
          openingCredit: 0,
          trxDebit: 0,
          trxCredit: 0,
          closingDebit: 0,
          closingCredit: 0,
        },
      };

      for (const par of ledger.particulars) {
        let openingDebit = 0;
        let openingCredit = 0;
        let trxDebit = 0;
        let trxCredit = 0;

        // Opening balance
        if (par.openingBalanceType === "Debit")
          openingDebit = par.openingBalance;
        else openingCredit = par.openingBalance;

        // Transaction balance
        const voucherSummary = await prisma.particularOnVoucher.groupBy({
          by: ["type"],
          where: {
            particularId: par.id,
            voucher: {
              branchId,
              date: {
                gte: new Date(fromDate),
                lte: new Date(toDate),
              },
            },
          },
          _sum: { amount: true },
        });

        voucherSummary.forEach((v) => {
          if (v.type === "Debit") trxDebit += v._sum.amount || 0;
          else trxCredit += v._sum.amount || 0;
        });

        const net = openingDebit - openingCredit + (trxDebit - trxCredit);

        let closingDebit = 0;
        let closingCredit = 0;

        if (net > 0) closingDebit = net;
        else closingCredit = Math.abs(net);

        // PUSH particular
        ledgerRow.particular.push({
          particularName: par.accountType ?? "Unnamed",
          openingDebit,
          openingCredit,
          trxDebit,
          trxCredit,
          closingDebit,
          closingCredit,
        });

        // LEDGER SUBTOTAL
        ledgerRow.subtotal.openingDebit += openingDebit;
        ledgerRow.subtotal.openingCredit += openingCredit;
        ledgerRow.subtotal.trxDebit += trxDebit;
        ledgerRow.subtotal.trxCredit += trxCredit;
        ledgerRow.subtotal.closingDebit += closingDebit;
        ledgerRow.subtotal.closingCredit += closingCredit;

        // GRAND TOTAL UPDATE
        grandTotal.openingDebit += openingDebit;
        grandTotal.openingCredit += openingCredit;
        grandTotal.trxDebit += trxDebit;
        grandTotal.trxCredit += trxCredit;
        grandTotal.closingDebit += closingDebit;
        grandTotal.closingCredit += closingCredit;
      }

      groupData.ledger.push(ledgerRow);
    }

    report.push(groupData);
  }

  return { report, grandTotal };
}

export interface ProfitLossReport {
  totalSales: number;
  purchaseAmount: number;
  revenueAfterCOGS: number;
  adminExpenses: number;
  sellingExpenses: number;
  grossProfit: number;
  nonOperatingIncome: number;
  earningBeforeTax: number;
  taxAmount: number;
  earningAfterTax: number;
}

export async function getProfitLossReport2({
  fromDate,
  toDate,
  branchId,
}: {
  fromDate: string;
  toDate: string;
  branchId: number;
}): Promise<ProfitLossReport> {
  const dateFilter = {
    gte: new Date(fromDate),
    lte: new Date(toDate),
  };

  // Helper to calculate SUM(Debit - Credit) or vice versa
  async function sumByGroup(accountType: string, isIncome = false) {
    const ledgers = await prisma.group.findMany({
      where: { branchId, accountType },
      include: {
        Ledger: {
          include: {
            particulars: true,
          },
        },
      },
    });

    let total = 0;

    for (const g of ledgers) {
      for (const l of g.Ledger) {
        for (const p of l.particulars) {
          const vouchers = await prisma.particularOnVoucher.groupBy({
            by: ["type"],
            where: {
              particularId: p.id,
              voucher: { branchId, date: dateFilter },
            },
            _sum: { amount: true },
          });

          vouchers.forEach((v) => {
            const amount = v._sum.amount || 0;
            if (isIncome) {
              // Income = Credit - Debit
              if (v.type === "Credit") total += amount;
              else total -= amount;
            } else {
              // Expense = Debit - Credit
              if (v.type === "Debit") total += amount;
              else total -= amount;
            }
          });
        }
      }
    }

    return total;
  }

  // 1️⃣ Total Sales (Income)
  const totalSales = await sumByGroup("Income", true);

  // 2️⃣ Purchase & Inventory Amount (COGS)
  const purchaseAmount = await sumByGroup("Expense"); // assuming purchases are in Expense category

  // 3️⃣ Administrative Expenses
  const adminExpenses = await sumByGroup("Administrative");

  // 4️⃣ Selling & Distribution Expenses
  const sellingExpenses = await sumByGroup("Selling");

  // 5️⃣ Non-operating Income
  const nonOperatingIncome = await sumByGroup("Other_Accounts", true);

  // 6️⃣ Revenue after COGS
  const revenueAfterCOGS = totalSales - purchaseAmount;

  // 7️⃣ Gross Profit / Loss
  const grossProfit = revenueAfterCOGS - adminExpenses - sellingExpenses;

  // 8️⃣ Earnings Before Tax (EBT)
  const earningBeforeTax = grossProfit + nonOperatingIncome;

  // 9️⃣ Tax (25%)
  const taxAmount = earningBeforeTax * 0.25;

  // 🔟 Earnings After Tax
  const earningAfterTax = earningBeforeTax - taxAmount;

  return {
    totalSales,
    purchaseAmount,
    revenueAfterCOGS,
    adminExpenses,
    sellingExpenses,
    grossProfit,
    nonOperatingIncome,
    earningBeforeTax,
    taxAmount,
    earningAfterTax,
  };
}

export async function getProfitLossReport({
  fromDate,
  toDate,
  branchId,
}: {
  fromDate: string;
  toDate: string;
  branchId: number;
}): Promise<ProfitLossReport> {
  const dateFilter = {
    gte: new Date(fromDate),
    lte: new Date(toDate),
  };

  // ✅ Step 1: Aggregate voucher data
  const data = await prisma.particularOnVoucher.groupBy({
    by: ["type", "particularId"],
    where: {
      voucher: {
        branchId,
        date: dateFilter,
      },
    },
    _sum: {
      amount: true,
    },
  });

  // ✅ Step 2: Fetch mapping (IMPORTANT: use account ENUM)
  const particulars = await prisma.particular.findMany({
    where: {
      ledger: {
        group: {
          branchId,
        },
      },
    },
    include: {
      ledger: {
        include: {
          group: true,
        },
      },
    },
  });

  const particularMap = new Map<number, { account: string }>();

  for (const p of particulars) {
    const account = p.ledger?.group?.account;
    if (account) {
      particularMap.set(p.id, { account });
    }
  }

  // ✅ Step 3: Totals
  let totalSales = 0;
  let purchaseAmount = 0;
  let adminExpenses = 0;
  let sellingExpenses = 0;
  let nonOperatingIncome = 0;

  // ✅ Step 4: Loop
  for (const row of data) {
    const mapping = particularMap.get(row.particularId);
    if (!mapping) continue;

    const { account } = mapping;
    const amount = row._sum.amount || 0;

    // 🔥 Income
    if (account === "Income") {
      totalSales += row.type === "Credit" ? amount : -amount;
    }

    // 🔥 Expense (ALL expense goes here)
    else if (account === "Expense") {
      purchaseAmount += row.type === "Debit" ? amount : -amount;
    }

    // 🔥 Other income
    else if (account === "Other_Accounts") {
      nonOperatingIncome += row.type === "Credit" ? amount : -amount;
    }

    // ❌ Ignore Assets, Liability, Equity
  }

  // ✅ Step 5: Calculations
  const revenueAfterCOGS = totalSales - purchaseAmount;

  const grossProfit = revenueAfterCOGS;

  const earningBeforeTax = grossProfit + nonOperatingIncome;

  const taxAmount = earningBeforeTax > 0 ? earningBeforeTax * 0.25 : 0;

  const earningAfterTax = earningBeforeTax - taxAmount;

  return {
    totalSales,
    purchaseAmount,
    revenueAfterCOGS,
    adminExpenses,
    sellingExpenses,
    grossProfit,
    nonOperatingIncome,
    earningBeforeTax,
    taxAmount,
    earningAfterTax,
  };
}
export const voucherLedger = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fromDate, toDate, particularId, branchId } = req.query;

    if (!fromDate || !toDate || !particularId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "From date, to date, particular id and branch id is required",
      });
    }
    const result = await getVoucherLedgerReport({
      fromDate: String(fromDate),
      toDate: String(toDate),
      particularId: Number(particularId),
      branchId: Number(branchId),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load voucher ledger report",
    });
  }
};
export const generalLedger = async (
  req: Request,
  res: Response,
) => {
  try {
    const { fromDate, toDate, particularId, branchId } = req.query;

    if (!fromDate || !toDate || !particularId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "From date, to date, particular id and branch id is required",
      });
    }
    const result = await getGeneralLedgerReport({
      fromDate: String(fromDate),
      toDate: String(toDate),
      particularId: Number(particularId),
      branchId: Number(branchId),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load general ledger report",
    });
  }
};
export const trialBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fromDate, toDate, branchId } = req.query;

    if (!fromDate || !toDate || !branchId) {
      return res.status(400).json({
        success: false,
        message: "From date, to date, particular id and branch id is required",
      });
    }
    const result = await getTrialBalanceReport({
      fromDate: String(fromDate),
      toDate: String(toDate),
      branchId: Number(branchId),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load trial balance report",
    });
  }
};
export const profitAndLoss = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, branchId } = req.query;

    if (!fromDate || !toDate || !branchId) {
      return res.status(400).json({
        success: false,
        message: "From date, to date, particular id and branch id is required",
      });
    }
    const result = await getProfitLossReport({
      fromDate: String(fromDate),
      toDate: String(toDate),
      branchId: Number(branchId),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load profit and loss report",
    });
  }
};
/**
 * Sales Report
 * @param req
 * @param res
 * @returns
 */
export const salesReport = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, branchId, page, size } = req.query;

    if (!fromDate || !toDate || !branchId) {
      return res.status(400).json({
        success: false,
        message: "From date, to date, particular id and branch id is required",
      });
    }

    const search = (req.query.search as string) || "";

    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(size as string) || 10;
    0;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const dateFilter = {
      gte: new Date(fromDate as string),
      lte: new Date(toDate as string),
    };

    const whereClause: Prisma.SaleWhereInput = {
      branchId: Number(branchId),
      date: dateFilter,

      ...(search && typeof search === "string"
        ? {
          invoiceNo: {
            contains: search,
          },
        }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        take,
        skip,
        where: whereClause,
        select: {
          id: true,
          branchId: true,
          date: true,
          invoiceNo: true,
          customerId: true,
          paymentAccountId: true,
          totalAmount: true,
          totalPaymentAmount: true,
          dueAmount: true,
          vat: true,
          tc: true,
          discount: true,
        },
      }),

      prisma.sale.count({
        where: whereClause,
      }),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sales retrieved successfully",
      meta: {
        page: page,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load profit and loss report",
    });
  }
};

/**
 * Sales Summary Report
 * @param req
 * @param res
 * @returns
 */
export const salesSummaryReport = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, branchId } = req.query;

    if (!fromDate || !toDate || !branchId) {
      return res.status(400).json({
        success: false,
        message: "From date, to date and branch id are required",
      });
    }

    const dateFilter = {
      gte: new Date(fromDate as string),
      lte: new Date(toDate as string),
    };

    const whereClause: Prisma.SaleWhereInput = {
      branchId: Number(branchId),
      date: dateFilter,
    };

    // Get all sales within date range
    const sales = await prisma.sale.findMany({
      where: whereClause,
      select: {
        totalAmount: true,
        vat: true,
      },
    });

    // 1️⃣ Calculate total income (value excluding VAT)
    const totalIncome = sales.reduce((sum, sale) => {
      return sum + (sale.totalAmount - sale.vat);
    }, 0);

    // 2️⃣ Initialize summary buckets (same as yours)
    const summary = {
      firstSlab: { valueExcl: 0, vatAmount: 0, netIncome: 350000, vatRate: 0 },
      onNext1: { valueExcl: 0, vatAmount: 0, netIncome: 100000, vatRate: 5 },
      onNext2: { valueExcl: 0, vatAmount: 0, netIncome: 400000, vatRate: 10 },
      onNext3: { valueExcl: 0, vatAmount: 0, netIncome: 500000, vatRate: 15 },
      onNext4: { valueExcl: 0, vatAmount: 0, netIncome: 500000, vatRate: 20 },
      onNext5: { valueExcl: 0, vatAmount: 0, netIncome: 2000000, vatRate: 25 },
      onRestSlab: {
        valueExcl: 0,
        vatAmount: 0,
        netIncome: Infinity,
        vatRate: 30,
      },
    };

    // 3️⃣ Apply progressive slab logic
    let remainingIncome = totalIncome;

    for (const key of Object.keys(summary) as (keyof typeof summary)[]) {
      if (remainingIncome <= 0) break;

      const slab = summary[key];

      const taxableAmount = Math.min(remainingIncome, slab.netIncome);
      const vatAmount = (taxableAmount * slab.vatRate) / 100;

      slab.valueExcl = taxableAmount;
      slab.vatAmount = vatAmount;

      remainingIncome -= taxableAmount;
    }

    // 4️⃣ Calculate totals
    const totalValue = totalIncome;

    const totalVat = Object.values(summary).reduce(
      (sum, slab) => sum + slab.vatAmount,
      0,
    );

    // 5️⃣ Response (UNCHANGED STRUCTURE)
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Sales summary report generated successfully",
      data: {
        rows: [
          {
            description: "On First slab",
            valueExcl: summary.firstSlab.valueExcl,
            vatRate: "0%",
            vatAmount: summary.firstSlab.vatAmount,
            sd: 0,
          },
          {
            description: "On Next slab",
            valueExcl: summary.onNext1.valueExcl,
            vatRate: "5%",
            vatAmount: summary.onNext1.vatAmount,
            sd: 0,
          },
          {
            description: "On Next slab",
            valueExcl: summary.onNext2.valueExcl,
            vatRate: "10%",
            vatAmount: summary.onNext2.vatAmount,
            sd: 0,
          },
          {
            description: "On Next slab",
            valueExcl: summary.onNext3.valueExcl,
            vatRate: "15%",
            vatAmount: summary.onNext3.vatAmount,
            sd: 0,
          },
          {
            description: "On Next slab",
            valueExcl: summary.onNext4.valueExcl,
            vatRate: "20%",
            vatAmount: summary.onNext4.vatAmount,
            sd: 0,
          },
          {
            description: "On Next slab",
            valueExcl: summary.onNext5.valueExcl,
            vatRate: "25%",
            vatAmount: summary.onNext5.vatAmount,
            sd: 0,
          },
          {
            description: "On the Rest Income",
            valueExcl: summary.onRestSlab.valueExcl,
            vatRate: "30%",
            vatAmount: summary.onRestSlab.vatAmount,
            sd: 0,
          },
        ],
        totals: {
          totalValueExcl: totalValue,
          totalVatAmount: totalVat,
          totalSD: 0,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate sales summary report",
    });
  }
};

/**
 * Purchase Report
 * @param req
 * @param res
 * @returns
 */
export const purchaseReport = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, branchId, page, size } = req.query;

    if (!fromDate || !toDate || !branchId) {
      return res.status(400).json({
        success: false,
        message: "From date, to date, particular id and branch id is required",
      });
    }

    const search = (req.query.search as string) || "";

    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(size as string) || 10;
    0;

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const dateFilter = {
      gte: new Date(fromDate as string),
      lte: new Date(toDate as string),
    };

    const whereClause: Prisma.PurchaseWhereInput = {
      branchId: Number(branchId),
      date: dateFilter,

      ...(search && typeof search === "string"
        ? {
          challanNo: {
            contains: search,
          },
        }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.purchase.findMany({
        take,
        skip,
        where: whereClause,
        select: {
          id: true,
          branchId: true,
          createdAt: true,
          updatedAt: true,
          date: true,
          challanNo: true,
          supplierId: true,
          paymentAccountId: true,
          totalAmount: true,
          totalPaymentAmount: true,
          dueAmount: true,
          previousDue: true,
          vat: true,
          tc: true,
          supplier: {
            select: {
              id: true,
              companyName: true,
              accountType: true,
              mobileNumber: true,
              email: true,
            },
          },
          account: {
            select: {
              id: true,
              companyName: true,
              accountType: true,
              mobileNumber: true,
              email: true,
            },
          },
        },
      }),

      prisma.purchase.count({
        where: whereClause,
      }),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Purchase retrieved successfully",
      meta: {
        page: page,
        size: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load profit and loss report",
    });
  }
};

export const purchaseSummaryReport = async (req: Request, res: Response) => {
  try {
    const { branchId, fromDate, toDate } = req.query;

    if (!branchId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Branch id, fromDate and toDate are required",
      });
    }

    const result = await prisma.purchase.aggregate({
      where: {
        branchId: Number(branchId),
        date: {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string),
        },
      },
      _sum: {
        totalAmount: true,
        vat: true,
      },
    });

    const totalAmount = result._sum.totalAmount || 0;
    const totalVat = result._sum.vat || 0;
    const valueExcl = totalAmount - totalVat;

    return res.status(200).json({
      success: true,
      message: "Purchase summary generated successfully",
      data: {
        rows: [
          {
            description: "All Purchases",
            valueExcl,
            vatPaid: totalVat,
            reclaimable: "Yes",
          },
        ],
        totals: {
          totalValueExcl: valueExcl,
          totalVatPaid: totalVat,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate purchase summary",
    });
  }
};

export const cashInHandReport = async (req: Request, res: Response) => {
  try {
    const { branchId, fromDate, toDate } = req.query;

    if (!branchId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Branch id, fromDate and toDate are required",
      });
    }

    const cash = await prisma.particular.findMany({
      where: {
        ledger: {
          ledgerType: {
            in: ["Cash In Hand"],
          },
        },
        branchId: Number(branchId),
      },
    });

    if (!cash) {
      return res.status(404).json({
        success: false,
        message: "Cash In Hand account not found",
      });
    }

    const cashAccIds = cash.map((c) => c.id);

    const from = new Date(fromDate as string);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate as string);
    to.setHours(23, 59, 59, 999);

    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        particularId: { in: cashAccIds },
        voucher: {
          date: {
            gte: from,
            lte: to,
          },
        },
      },
      select: {
        id: true,
        type: true,
        amount: true,
        voucher: {
          select: {
            id: true,
            voucherNo: true,
            date: true,
            type: true,
            narration: true,
            particulars: {
              select: {
                id: true,
                particular: true,
                particularId: true,
              },
            },
          },
        },
        particular: true,
      },
      orderBy: {
        voucher: {
          date: "asc",
        },
      },
    });

    // return res.send(entries);

    let totalDebit = 0;
    let totalCredit = 0;
    let runningBalance = 0;

    const report = entries.map((entry) => {
      // find opposite particular
      // const opposite = entry.voucher.particulars.find((p) =>
      //   cashAccIds.includes(p.particularId),
      // );

      let debit = 0;
      let credit = 0;

      if (entry.type === "Debit") {
        debit = entry.amount;
        totalDebit += entry.amount;
        runningBalance += entry.amount;
      } else {
        credit = entry.amount;
        totalCredit += entry.amount;
        runningBalance -= entry.amount;
      }

      const balanceDebit = runningBalance > 0 ? runningBalance : 0;
      const balanceCredit = runningBalance < 0 ? Math.abs(runningBalance) : 0;

      return {
        date: entry.voucher.date,
        voucherNo: entry.voucher.voucherNo,
        description: entry.voucher.narration || "",
        // opposite: opposite?.particular.accountType,
        debit,
        credit,
        balanceDebit,
        balanceCredit,
      };
    });

    const lastRow = report[report.length - 1];

    return res.status(200).json({
      success: true,
      message: "Purchase summary generated successfully",
      data: {
        rows: report,
        summary: {
          totalDebit,
          totalCredit,
          totalBalanceDebit: lastRow.balanceDebit,
          totalBalanceCredit: lastRow.balanceCredit,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate purchase summary",
    });
  }
};

export const ledgerReport = async (req: Request, res: Response) => {
  try {
    const { branchId, fromDate, toDate } = req.query;

    if (!branchId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "branchId, fromDate and toDate are required",
      });
    }

    const from = new Date(fromDate as string);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate as string);
    to.setHours(23, 59, 59, 999);

    /**
     * STEP 1
     * Fetch Accounts
     */

    const accounts = await prisma.particular.findMany({
      where: {
        branchId: Number(branchId),
      },
      select: {
        id: true,
        companyName: true,
        accountType: true,
        openingBalance: true,
        openingBalanceType: true,
        balance: true,
      },
    });

    if (!accounts.length) {
      return res.status(404).json({
        success: false,
        message: "No accounts found",
      });
    }

    const accountIds = accounts.map((a) => a.id);

    /**
     * STEP 2
     * Fetch all voucher entries once
     */

    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        particularId: { in: accountIds },
        voucher: {
          date: {
            lte: to,
          },
        },
      },
      include: {
        particular: true,
        voucher: {
          include: {
            particulars: {
              include: {
                particular: {
                  select: {
                    id: true,
                    companyName: true,
                    accountType: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        voucher: {
          date: "asc",
        },
      },
    });

    /**
     * STEP 3
     * Group entries by account
     */

    const entriesByAccount = new Map<number, typeof entries>();

    for (const entry of entries) {
      if (!entriesByAccount.has(entry.particularId)) {
        entriesByAccount.set(entry.particularId, []);
      }

      entriesByAccount.get(entry.particularId)!.push(entry);
    }

    /**
     * STEP 4
     * Build ledger report
     */

    const results = [];

    for (const account of accounts) {
      const accountEntries = entriesByAccount.get(account.id) || [];

      let openingBalance =
        account.openingBalanceType === "Debit"
          ? account.openingBalance
          : -account.openingBalance;

      /**
       * Calculate opening balance before fromDate
       */

      for (const entry of accountEntries) {
        if (entry.voucher.date < from) {
          if (entry.type === "Debit") {
            openingBalance += entry.amount;
          } else {
            openingBalance -= entry.amount;
          }
        }
      }

      let runningBalance = openingBalance;

      const ledgers = [];
      let totalDebit = 0;
      let totalCredit = 0;

      for (const entry of accountEntries) {
        if (entry.voucher.date < from) continue;
        if (entry.voucher.date > to) continue;

        let debit = 0;
        let credit = 0;

        if (entry.type === "Debit") {
          debit = entry.amount;
          runningBalance += entry.amount;
          totalDebit += entry.amount;
        } else {
          credit = entry.amount;
          runningBalance -= entry.amount;
          totalCredit += entry.amount;
        }

        /**
         * Find opposite account
         */

        const opposite = entry.voucher.particulars.find(
          (p) => p.particularId !== account.id,
        );

        ledgers.push({
          id: entry.id,
          date: entry.voucher.date,
          voucherNo: entry.voucher.voucherNo,
          voucherType: entry.voucher.type,
          description: entry.voucher.narration,
          oppositeAccount: opposite?.particular?.accountType || null,
          debit,
          credit,
          balance: Math.abs(runningBalance), // always positive
          balanceType: runningBalance >= 0 ? "Dr" : "Cr",
        });
      }

      const closingBalance = runningBalance;

      if (ledgers?.length) {
        results.push({
          accountName: account.accountType,
          openingBalance: {
            balance: Math.abs(openingBalance),
            balanceType: openingBalance >= 0 ? "Dr" : "Cr",
            date: fromDate,
          },
          transactions: ledgers,
          summary: {
            totalDebit,
            totalCredit,
            closingBalance: {
              balance: Math.abs(closingBalance),
              balanceType: closingBalance >= 0 ? "Dr" : "Cr",
              date: toDate,
            },
          },
        });

      }

    }

    return res.status(200).json({
      success: true,
      message: "Ledger report generated successfully",
      data: results,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate ledger report",
    });
  }
};

type TrialBalanceRow = {
  particularId: number;
  group: string;
  ledger: string;
  ledgerNo?: string;
  accountDescription: string;
  debit: number;
  credit: number;
};

export const TrialBalanceReport = async (req: Request, res: Response) => {
  try {
    if (!req.query.branchId || !req.query.fromDate || !req.query.toDate) {
      return res.status(400).json({
        success: false,
        message: "branchId, fromDate and toDate are required",
      });
    }

    const branchId = Number(req.query.branchId);

    const from = new Date(req.query.fromDate as string);
    from.setHours(0, 0, 0, 0);

    const to = new Date(req.query.toDate as string);
    to.setHours(23, 59, 59, 999);

    /**
     * Fetch all particulars
     */
    const particulars = await prisma.particular.findMany({
      where: { branchId },
      include: {
        ledger: {
          include: {
            group: true,
          },
        },
      },
    });

    /**
     * Fetch all voucher entries once
     */
    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          branchId,
          date: { lte: to },
        },
      },
    });

    /**
     * Group entries by particular
     */
    const entryMap = new Map<number, typeof entries>();

    for (const e of entries) {
      if (!entryMap.has(e.particularId)) {
        entryMap.set(e.particularId, []);
      }

      entryMap.get(e.particularId)!.push(e);
    }

    const rows: TrialBalanceRow[] = [];

    let totalDebit = 0;
    let totalCredit = 0;

    for (const p of particulars) {
      let balance =
        p.openingBalanceType === "Debit" ? p.openingBalance : -p.openingBalance;

      const pEntries = entryMap.get(p.id) || [];

      for (const e of pEntries) {
        if (e.type === "Debit") balance += e.amount;
        else balance -= e.amount;
      }

      let debit = 0;
      let credit = 0;

      if (balance > 0) {
        debit = balance;
        totalDebit += debit;
      } else if (balance < 0) {
        credit = Math.abs(balance);
        totalCredit += credit;
      }

      if (debit === 0 && credit === 0) continue;

      rows.push({
        particularId: p.id,
        group: p.ledger.group.account,
        ledger: p.ledger.ledgerType,
        ledgerNo: p.ledger.code ?? "",
        accountDescription: p.accountType,
        debit,
        credit,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trial balance generated successfully",
      data: {
        rows,
        totals: {
          debit: totalDebit,
          credit: totalCredit,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate trial balance",
    });
  }
};

export const TrailBalanceReport = async (req: Request, res: Response) => {
  try {
    if (!req.query.branchId || !req.query.fromDate || !req.query.toDate) {
      return res.status(400).json({
        success: false,
        message: "branchId, fromDate and toDate are required",
      });
    }

    const branchId = Number(req.query.branchId);

    const from = new Date(req.query.fromDate as string);
    from.setHours(0, 0, 0, 0);

    const to = new Date(req.query.toDate as string);
    to.setHours(23, 59, 59, 999);

    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          branchId,
          date: {
            gte: from,
            lte: to,
          },
        },
      },
      include: {
        particular: {
          include: {
            ledger: {
              include: {
                group: true,
              },
            },
          },
        },
      },
    });

    const map: Record<number, TrialBalanceRow> = {};

    for (const e of entries) {
      const id = e.particularId;

      if (!map[id]) {
        map[id] = {
          particularId: id,
          accountDescription: e.particular.accountType,
          ledger: e.particular.ledger.ledgerType,
          ledgerNo: e.particular?.ledger?.code ?? "",
          group: e.particular.ledger.group.account,
          debit: 0,
          credit: 0,
        };

        // Opening balance from particular
        if (e.particular.openingBalance) {
          if (e.particular.openingBalanceType === "Debit") {
            map[id].debit += e.particular.openingBalance;
          } else {
            map[id].credit += e.particular.openingBalance;
          }
        }
      }

      if (e.type === "Debit") {
        map[id].debit += e.amount;
      } else {
        map[id].credit += e.amount;
      }
    }

    const rows = Object.values(map);

    let totalDebit = 0;
    let totalCredit = 0;

    for (const r of rows) {
      totalDebit += r.debit;
      totalCredit += r.credit;
    }

    // -----------------------------
    // Opening balance calculation
    // -----------------------------

    const openingEntries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          branchId,
          date: {
            lt: from,
          },
        },
      },
    });

    let openingBalanceAmount = 0;

    for (const e of openingEntries) {
      if (e.type === "Debit") {
        openingBalanceAmount += e.amount;
      } else {
        openingBalanceAmount -= e.amount;
      }
    }

    // -----------------------------
    // Closing balance calculation
    // -----------------------------

    const periodEntries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          branchId,
          date: {
            gte: from,
            lte: to,
          },
        },
      },
    });

    let totalDebitAmount = 0;
    let totalCreditAmount = 0;

    for (const e of periodEntries) {
      if (e.type === "Debit") totalDebitAmount += e.amount;
      else totalCreditAmount += e.amount;
    }

    const closingBalance =
      openingBalanceAmount + totalDebitAmount - totalCreditAmount;

    // -----------------------------
    // Group rows for report layout
    // -----------------------------

    const inflows = rows.filter((r) => r.debit > 0);
    const outflows = rows.filter((r) => r.credit > 0);

    return res.status(200).json({
      success: true,
      message: "Trial balance generated successfully",
      data: {
        openingBalance: openingBalanceAmount,

        inflows, // Debit items
        outflows, // Credit items

        closingBalance,

        totals: {
          debit: totalDebit,
          credit: totalCredit,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate trial balance",
    });
  }
};

type CashFlowRow = {
  sl: number;
  accountDescription: string;
  ledgerNo?: string;
  debit: number;
  credit: number;
};

export const CashFlowReport = async (req: Request, res: Response) => {
  try {
    const { branchId, fromDate, toDate } = req.query;

    if (!branchId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "branchId, fromDate and toDate are required",
      });
    }

    const branch = Number(branchId);

    const from = new Date(fromDate as string);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate as string);
    to.setHours(23, 59, 59, 999);

    /**
     * Opening balance (same as before)
     */
    const openingEntries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          branchId: branch,
          date: { lt: from },
        },
      },
    });

    let openingBalance = 0;

    for (const e of openingEntries) {
      if (e.type === "Debit") openingBalance += e.amount;
      else openingBalance -= e.amount;
    }

    /**
     * Transactions during period
     */
    const entries = await prisma.particularOnVoucher.findMany({
      where: {
        voucher: {
          branchId: branch,
          date: { gte: from, lte: to },
        },
      },
      include: {
        particular: {
          include: {
            ledger: true,
          },
        },
      },
    });

    /**
     * 🔥 GROUPING LOGIC
     */
    const accountMap: Record<
      string,
      { debit: number; credit: number; ledgerNo: string }
    > = {};

    for (const e of entries) {
      const key = e.particular.accountType;

      if (!accountMap[key]) {
        accountMap[key] = {
          debit: 0,
          credit: 0,
          ledgerNo: e.particular?.ledger?.code ?? "",
        };
      }

      if (e.type === "Debit") {
        accountMap[key].debit += e.amount;
      } else {
        accountMap[key].credit += e.amount;
      }
    }

    /**
     * 🔥 FINAL INFLOW / OUTFLOW (NET)
     */
    const inflows: CashFlowRow[] = [];
    const outflows: CashFlowRow[] = [];

    let sl = 1;
    let totalDebit = 0;
    let totalCredit = 0;

    for (const [account, value] of Object.entries(accountMap)) {
      const net = value.debit - value.credit;

      if (net > 0) {
        // Inflow
        inflows.push({
          sl: sl++,
          accountDescription: account,
          ledgerNo: value.ledgerNo,
          debit: net,
          credit: 0,
        });
        totalDebit += net;
      } else if (net < 0) {
        // Outflow
        outflows.push({
          sl: sl++,
          accountDescription: account,
          ledgerNo: value.ledgerNo,
          debit: 0,
          credit: Math.abs(net),
        });
        totalCredit += Math.abs(net);
      }
    }

    /**
     * Closing balance
     */
    const closingBalance = openingBalance + totalDebit - totalCredit;

    return res.status(200).json({
      success: true,
      data: {
        openingBalance,
        inflows,
        outflows,
        closingBalance,
        totals: {
          debit: openingBalance + totalDebit,
          credit: totalCredit + Math.abs(closingBalance),
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Report generation failed",
    });
  }
};

export const stockReport = async (req: Request, res: Response) => {
  try {
    const branchId = Number(req.query.branchId);

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "branchId is required",
      });
    }

    /**
     * Fetch all variations
     */
    const variations = await prisma.productVariation.findMany({
      where: { branchId },
      include: {
        product: {
          select: {
            name: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
          },
        },
        size: { select: { name: true } },
      },
    });

    /**
     * Group transactions
     */

    const [purchase, sale, purchaseReturn, saleReturn] = await Promise.all([
      prisma.purchaseProduct.groupBy({
        by: ["variationProductId"],
        where: { branchId },
        _sum: { quantity: true },
      }),

      prisma.saleProduct.groupBy({
        by: ["variationProductId"],
        where: { branchId },
        _sum: { quantity: true },
      }),

      prisma.purchaseReturnProduct.groupBy({
        by: ["variationProductId"],
        where: { branchId },
        _sum: { quantity: true },
      }),

      prisma.salesReturnProduct.groupBy({
        by: ["variationProductId"],
        where: { branchId },
        _sum: { quantity: true },
      }),
    ]);

    /**
     * Build map for fast lookup
     */

    const statsMap = new Map<number, any>();

    const addToMap = (data: any[], key: string) => {
      for (const row of data) {
        const current = statsMap.get(row.variationProductId) || {};

        statsMap.set(row.variationProductId, {
          ...current,
          [key]: row._sum.quantity || 0,
        });
      }
    };

    addToMap(purchase, "purchase");
    addToMap(sale, "sale");
    addToMap(purchaseReturn, "purchaseReturn");
    addToMap(saleReturn, "saleReturn");

    /**
     * Build rows
     */

    const rows: any[] = [];

    let totalPurchase = 0;
    let totalSale = 0;
    let totalPurchaseReturn = 0;
    let totalSaleReturn = 0;
    let totalStock = 0;
    let totalStockValuePurchase = 0;
    let totalStockValueSale = 0;
    let totalPurchasePrice = 0;
    let totalSalePrice = 0;

    variations.forEach((v, index) => {
      const stats = statsMap.get(v.id) || {};

      const purchaseQty = stats.purchase || 0;
      const saleQty = stats.sale || 0;
      const purchaseReturnQty = stats.purchaseReturn || 0;
      const saleReturnQty = stats.saleReturn || 0;

      const stock = purchaseQty - saleQty - purchaseReturnQty + saleReturnQty;

      const stockValuePurchase = stock * v.purchasePrice;
      const stockValueSale = stock * v.salePrice;

      rows.push({
        row: index + 1,

        productName: v.product.name,
        brand: v.product.brand?.name || null,
        category: v.product.category?.name || null,
        subCategory: v.product.subCategory?.name || null,
        size: v.size?.name || null,

        purchaseQty,
        saleQty,
        purchaseReturnQty,
        saleReturnQty,

        currentStock: stock,

        purchasePrice: v.purchasePrice,
        salePrice: v.salePrice,

        stockValuePurchase,
        stockValueSale,
      });

      totalPurchase += purchaseQty;
      totalSale += saleQty;
      totalPurchaseReturn += purchaseReturnQty;
      totalSaleReturn += saleReturnQty;
      totalStock += stock;
      totalPurchasePrice += v.purchasePrice;
      totalSalePrice += v.salePrice;

      totalStockValuePurchase += stockValuePurchase;
      totalStockValueSale += stockValueSale;
    });

    /**
     * Summary
     */

    const summary = {
      totalPurchase,
      totalSale,
      totalPurchaseReturn,
      totalSaleReturn,
      totalStock,
      totalPurchasePrice,
      totalSalePrice,
      totalStockValuePurchase,
      totalStockValueSale,
    };

    return res.json({
      success: true,
      message: "Stock report generated successfully",
      rows,
      summary,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Stock report failed",
    });
  }
};
