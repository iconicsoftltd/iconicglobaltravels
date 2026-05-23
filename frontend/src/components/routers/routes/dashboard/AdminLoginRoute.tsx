
import AdminForgetPassword from "@/components/dashboard/auth/AdminForgetPassword";
import AdminLogin from "@/components/dashboard/auth/AdminLogin";
import AdminResetPassword from "@/components/dashboard/auth/AdminResetPassword";
import VerifySuccess from "@/pages/dashboard/user/VerifySuccess";
import React, { ReactNode } from "react";

export interface IRouteProps {
  path: string;
  element: ReactNode;
  loader?: any;
}

export const adminLoginRoutes: IRouteProps[] = [
  {
    path: "admin-login",
    element: React.createElement(AdminLogin),
  },
  {
    path: "forget-password",
    element: React.createElement(AdminForgetPassword),
  },
  {
    path: "verify-account",
    element: React.createElement(VerifySuccess),
  },
  {
    path: "admin-forget-password",
    element: React.createElement(AdminForgetPassword),
  },
  {
    path: "reset-password",
    element: React.createElement(AdminResetPassword),
  },
];
