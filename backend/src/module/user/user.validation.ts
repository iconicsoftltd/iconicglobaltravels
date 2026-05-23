import { z } from "zod";
import { verifyBody } from "../../middleware/validation";

const userValidation = z.object({
  roleId: z.number().min(1, "RoleId is required"),
  employeeId: z.number().min(1, "branchId is required"),
  password: z
    .string()
    .min(6, "password is required")
    .max(16, "password is too long"),
});

export const verifyUser = verifyBody(userValidation);

const userLoginValidation = z.object({
  email: z.string().email().min(1, "email is required"),
  password: z
    .string()
    .min(6, "password is required")
    .max(16, "password is too long"),
});

export const verifyUserLogin = verifyBody(userLoginValidation);

const userUpdateValidation = z.object({
  roleId: z.number(),
  employeeId: z.number(),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const verifyUserUpdate = verifyBody(userUpdateValidation);

const changePassword = z.object({
  oldPassword: z
    .string()
    .min(6, "oldPassword is required")
    .max(16, "oldPassword is too long"),
  newPassword: z
    .string()
    .min(6, "newPassword is required")
    .max(16, "newPassword is too long"),
  confirmPassword: z
    .string()
    .min(6, "confirmPassword is required")
    .max(16, "confirmPassword is too long"),
});

export const verifyChangePassword = verifyBody(changePassword);
const forgetPassword = z.object({
  code: z.string().min(8, "code is required"),
  newPassword: z
    .string()
    .min(6, "newPassword is required")
    .max(16, "newPassword is too long"),
  confirmPassword: z
    .string()
    .min(6, "confirmPassword is required")
    .max(16, "confirmPassword is too long"),
});

export const verifyForgetPassword = verifyBody(forgetPassword);

const profileUpdate = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  nid: z.string(),
  image: z.string(),
});

export const verifyProfileUpdate = verifyBody(profileUpdate);

// @Types
export type IUserUpdate = z.infer<typeof userUpdateValidation>;
