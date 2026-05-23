import { FC, ReactNode } from "react";
import getPermission from "@/utils/helper/getPermission";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  module: string;
  action?: string;
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
  module,
  action = "read",
  children,
}) => {
  const hasPermission = getPermission(module, action);
  if (!hasPermission) {
    return <Navigate to="" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
