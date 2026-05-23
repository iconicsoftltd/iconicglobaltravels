import AdminSidebarNavigationLargeDevice from "@/components/navigation/admin/AdminSidebarNavigationLargeDevice";
import AdminSidebarNavigationSmallDevice from "@/components/navigation/admin/AdminSidebarNavigationSmallDevice";
import AdminUpperNavigation from "@/components/navigation/admin/AdminUpperNavigation";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile Sidebar
  return (
    <div className="flex flex-col min-h-[100vh]">
      {/* Upper Navigation */}
      <div className="w-full">
        <AdminUpperNavigation
          setMobileSidebarOpen={setMobileSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Section */}
        <AdminSidebarNavigationLargeDevice />
        <AdminSidebarNavigationSmallDevice
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* Page Content */}
        <main
          className={`flex-1 mt-[64px] bg-primary-50 transition-all duration-300 lg:ml-[280px]
            } p-2 md:p-6 overflow-hidden`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
