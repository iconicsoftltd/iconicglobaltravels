import * as z from "zod";

export const salaryStructureSchema = z.object({
  basicSalary: z.number().min(0).default(0),
  houseRent: z.number().min(0).default(0),
  medical: z.number().min(0).default(0),
  transport: z.number().min(0).default(0),
  food: z.number().min(0).default(0),
  casualLeave: z.number().min(0).default(0),
  medicalLeave: z.number().min(0).default(0),
});

export type SalaryStructureData = z.infer<typeof salaryStructureSchema>;

export interface ISalaryStructure extends SalaryStructureData {
  id: number;
  createdAt: string;
  updatedAt: string;
}
