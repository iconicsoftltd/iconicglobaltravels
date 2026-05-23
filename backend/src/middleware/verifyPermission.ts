import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prisma";
export enum Module {
  Dashboard = "Dashboard",
  User = "User",
  Branch = "Branch",
  Employee = "Employee",
  Designation = "Designation",
  Role = "Role",
  Date = "Date",  // ✅ এটা যোগ করুন
  Department = "Department",
  Branch_Assign = "Branch_Assign",
  Group = "Group",
  Ledger = "Ledger",
  Particular = "Particular",
  Voucher = "Voucher",
  Category = "Category",
  SubCategory = "SubCategory",
  Size = "Size",
  Color = "Color",
  Unit = "Unit",
  Brand = "Brand",
  Product = "Product",
  Product_Variation = "Product_Variation",
  Chart_Of_Account = "Chart_Of_Account",
  Purchase = "Purchase",
  Purchase_Return = "Purchase_Return",
  Sales = "Sales",
  Sales_Return = "Sales_Return",
  Trial_Balance = "Trial_Balance",
  Profit_And_Loss = "Profit_And_Loss",
  General_Ledger = "General_Ledger",
  Voucher_Ledger = "Voucher_Ledger",
  Balance_Sheet = "Balance_Sheet",
  Service = "Service",
  Service_Sales = "Service_Sales",
  Income_Statement = "Income_Statement",
  Owner_Security = "Owner_Security",
  Quotation = "Quotation",
  Bank = "Bank",
  Cheque = "Cheque",
  Salary_Structure = "Salary_Structure",
  Leave_Day_Setup = "Leave_Day_Setup",
  Leave_Apply = "Leave_Apply",
  Salary = "Salary",
  Audit_Log = "Audit_Log",
}

export enum Action {
  create = "create",
  read = "read",
  update = "update",
  delete = "delete",
}

export const verifyPermission = (module: Module, action: Action) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as {
      id: number;
      roleId: number;
      isSuperAdmin: boolean;
    };
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    // if (user.isSuperAdmin) return next();

    // 1) check userPermission
    const up = await prisma.userPermission.findFirst({
      where: {
        userId: user.id,
        isAllowed: true,
        permission: { module, action },
      },
      include: { permission: true },
    });
    if (up) return next();

    // 2) role permission
    const rp = await prisma.rolePermission.findFirst({
      where: {
        roleId: user.roleId,
        permission: { module, action },
        isAllowed: true,
      },
      include: { permission: true },
    });
    if (rp) return next();
    return res.status(403).json({ message: "Forbidden access permission" });
  };
};
