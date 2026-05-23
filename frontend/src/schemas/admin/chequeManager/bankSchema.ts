import { z } from "zod";

export const bankCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type BankCreateProps = z.infer<typeof bankCreateSchema>;
