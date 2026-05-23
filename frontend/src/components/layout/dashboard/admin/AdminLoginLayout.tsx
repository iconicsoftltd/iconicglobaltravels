import { Outlet } from "react-router-dom";

export default function AdminLoginLayout() {
  return (
    <div className="flex flex-col bg-[#F5F6FA]">
      {/* Main Content */}
      <div className="overflow-hidden">
        {/* Page Content */}
        <main
          className={`transition-all duration-300 w-full p-6 bg-gray-100`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
