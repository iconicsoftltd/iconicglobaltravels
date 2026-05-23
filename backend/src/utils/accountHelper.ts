import { Account, BalanceType } from "@prisma/client";
import prisma from "./prisma";

type LedgerParticularConfig = {
    accountType: string;
    type: BalanceType;
    openingBalanceType: BalanceType;
};

type LedgerConfig = {
    ledgerType: string;
    particular?: LedgerParticularConfig;
};

type GroupConfig = {
    account: Account;
    accountType: string;
    ledgers: LedgerConfig[];
};

const ACCOUNTING_STRUCTURE: GroupConfig[] = [
    {
        account: Account.Assets,
        accountType: "Current Assets",
        ledgers: [
            {
                ledgerType: "Cash In Hand",
                particular: {
                    accountType: "Cash In Hand",
                    type: BalanceType.Debit,
                    openingBalanceType: BalanceType.Debit,
                },
            },
            { ledgerType: "Cash At Bank" },
            { ledgerType: "Accounts Receivable" },
            {
                ledgerType: "Inventory",
                particular: {
                    accountType: "Inventory",
                    type: BalanceType.Credit,
                    openingBalanceType: BalanceType.Credit,
                },
            },
        ],
    },
    {
        account: Account.Liability,
        accountType: "Liability",
        ledgers: [{ ledgerType: "Accounts Payable" }],
    },
    {
        account: Account.Expense,
        accountType: "Expense",
        ledgers: [
            {
                ledgerType: "COGS",
                particular: {
                    accountType: "COGS",
                    type: BalanceType.Debit,
                    openingBalanceType: BalanceType.Debit,
                },
            },
            {
                ledgerType: "Salary Expense",
            },
        ],
    },
    {
        account: Account.Income,
        accountType: "Income",
        ledgers: [
            {
                ledgerType: "Sales",
                particular: {
                    accountType: "Sales",
                    type: BalanceType.Credit,
                    openingBalanceType: BalanceType.Credit,
                },
            },
            {
                ledgerType: "Service",
                particular: {
                    accountType: "Service",
                    type: BalanceType.Credit,
                    openingBalanceType: BalanceType.Credit,
                },
            },
        ],
    },
];


export const setupDefaultAccounting = async (branchId: number) => {
    try {
        await prisma.$transaction(async (tx) => {
            for (const group of ACCOUNTING_STRUCTURE) {
                await tx.group.create({
                    data: {
                        branchId,
                        account: group.account,
                        accountType: group.accountType,

                        Ledger: {
                            create: group.ledgers.map((ledger) => ({
                                branchId,
                                ledgerType: ledger.ledgerType,

                                ...(ledger.particular && {
                                    particulars: {
                                        create: {
                                            branchId,
                                            accountType: ledger.particular.accountType,
                                            balance: 0,
                                            openingBalance: 0,
                                            openingBalanceType:
                                                ledger.particular.openingBalanceType,
                                            type: ledger.particular.type,
                                        },
                                    },
                                }),
                            })),
                        },
                    },
                });
            }
        });

        return true;
    } catch (error) {
        console.error("Accounting setup failed:", error);
        return false;
    }
};

