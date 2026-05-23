import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "../../pages/errorPage/ErrorPage";
import AdminLayout from "../layout/dashboard/admin/AdminLayout";
import { adminRoutes } from "./routes/dashboard/adminRoute";
import AdminLoginLayout from "../layout/dashboard/admin/AdminLoginLayout";
import { adminLoginRoutes } from "./routes/dashboard/AdminLoginRoute";
import AdminRoutes from "./routeWrapper/AdminRoute";

const routers = createBrowserRouter([
  // Redirect root path to login
  {
    path: "/",
    element: <Navigate to="/admin_home" replace />,
    errorElement: <ErrorPage />,
  },

  // Admin Dashboard (protected routes)
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: (
      <Suspense fallback={<div>Loading Admin Dashboard...</div>}>
        <AdminRoutes>
         <AdminLayout />
        </AdminRoutes>
      </Suspense>
    ),
    children: [...adminRoutes],
  },
  // Public Login Routes
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: (
      <Suspense fallback={<div>Loading Public Pages...</div>}>
        <AdminLoginLayout />
      </Suspense>
    ),
    children: [...adminLoginRoutes],
  },
]);

export default routers;
