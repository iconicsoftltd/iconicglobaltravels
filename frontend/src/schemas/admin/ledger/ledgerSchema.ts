import * as z from "zod";

export const ledgerSchema = z.object({
  groupAccountId: z.coerce.number().min(1, "groupAccountId is required"),
  ledgerType: z.string().min(1, "ledgerType is required"),
  code: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type LedgerData = z.infer<typeof ledgerSchema>;

export interface ILedger extends LedgerData {
  id: number;
  balance: number;
  group: {
    account: string,
    accountType: string,
  };
}
