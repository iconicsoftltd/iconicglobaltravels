import * as z from "zod";

export const groupSchema = z.object({
  account: z
    .enum(["Assets", "Liability", "Equity", "Income", "Expense", "Other_Accounts"]),
  accountType: z.string().min(1, "accountType is required"),
  code: z.string().optional(),
});

export type GroupData = z.infer<typeof groupSchema>;

export interface IGroup extends GroupData {
  id: number;
}
