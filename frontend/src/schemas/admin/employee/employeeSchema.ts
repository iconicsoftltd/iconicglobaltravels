import * as z from "zod";

export const employeeSchema = z.object({
  departmentId: z.number().min(1, "departmentId is required"),
  designationId: z.number().min(1, "designationId is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "email is required"),
  phone: z.string().min(11, "Phone is required"),
  address: z.string().min(1, "address is required"),
  nid: z.string().min(1, "nid is required"),
  salary: z.coerce.number().min(1, "salary is required"),
  joiningDate: z.string().min(1, "joiningDate is required"),
  image: z.string().min(1, "image is required"),
});

export type EmployeeData = z.infer<typeof employeeSchema>;

export interface IEmployee extends EmployeeData {
  isActive: boolean;
  id: number;
}
