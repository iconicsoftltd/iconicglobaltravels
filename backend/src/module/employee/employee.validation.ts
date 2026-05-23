import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const EmployeeValidation = z.object({
  departmentId: z.number().min(1, "departmentId is required"),
  designationId: z.number().min(1, "designationId is required"),
  branchId: z.number().min(1, "branchId is required"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(11, "Phone is required"),
  email: z.string().min(1, "email is required"),
  address: z.string().min(1, "address is required"),
  nid: z.string().min(1, "nid is required"),
  salary: z.number().min(1, "salary is required"),
  joiningDate: z.string().min(1, "joiningDate is required"),
  image: z.string().min(1, "image is required"),
});

export const verifyEmployee = verifyBody(EmployeeValidation);

export type ICreateEmployee = z.infer<typeof EmployeeValidation>;
