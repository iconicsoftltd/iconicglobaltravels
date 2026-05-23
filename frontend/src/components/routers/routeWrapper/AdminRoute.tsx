import {
  setDatePermission,
  setPermissions,
} from "@/components/store/api/premission/permissionsSlice";
import { useGetPermissionByUserQuery } from "@/components/store/api/user/UserPermissionApi";
import {
  selectUser,
  selectPermissions,
  selectPermissionsLoaded,
  AppDispatch,
} from "@/components/store/store";
import { shareAuthentication } from "@/utils/helper/shareAuthentiaction";
import { FC, ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const AdminRoutes: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const auth = shareAuthentication();
  const user = useSelector(selectUser);
  const permissions = useSelector(selectPermissions);
  const permissionsLoaded = useSelector(selectPermissionsLoaded);
  const dispatch: AppDispatch = useDispatch();

  const { data: permissionsData } = useGetPermissionByUserQuery(user?.id, {
    skip: !user?.id || permissions.length > 0,
  });

  useEffect(() => {
    if (permissionsData?.user?.permissions && permissions.length === 0) {
      dispatch(setPermissions(permissionsData.user.permissions));

      // ✅ Date permission set করুন
      const allPerms = permissionsData.user.permissions;
      const dateRead = allPerms.find(
        (p: any) => p.module === "Date" && p.action === "read",
      );
      const dateCreate = allPerms.find(
        (p: any) => p.module === "Date" && p.action === "create",
      );
      dispatch(
        setDatePermission({
          read: dateRead?.isAllowed ?? false,
          create: dateCreate?.isAllowed ?? false,
        }),
      );
    }
  }, [permissionsData, permissions.length, dispatch]);

  if (!auth?.email) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // Prevent sidebar rendering before permissions are ready
  if (!permissionsLoaded) {
    return null;
  }

  return children;
};

export default AdminRoutes;
