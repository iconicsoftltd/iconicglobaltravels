import { Button } from "@/components/ui/button";
import useDropdown from "@/hooks/useDropdown";
import { LucideLogOut } from "lucide-react";
import { VscTriangleLeft } from "react-icons/vsc";
import { Link } from "react-router-dom";

const AdminUserDropdown = ({ user, handleLogout }: any) => {
  const { dropdownOpen, setDropdownOpen, dropdownRef } = useDropdown();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Icon and Name/Role */}
      <div
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer transition duration-200 hover:opacity-90"
      >
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img src={`${user?.image}`} className="w-full h-full" alt="" />
        </div>
        <div className="hidden sm:block text-sm">
          <div className="font-semibold">
            {user?.name || "Iconic Unity Group"}
          </div>
          <div className="text-xs opacity-80">{user?.role}</div>
        </div>
        <VscTriangleLeft
          className={`w-3 h-3 ml-2 transition-transform ${
            dropdownOpen ? "rotate-90" : "-rotate-90"
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md z-10 overflow-hidden">
          <Link
            to="/profile"
            className="block px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Profile
          </Link>
          <Link
            to="/admin-change-password"
            className="block px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Change Password
          </Link>
          {/* <button
            onClick={handleLogout}
            className="block px-4 py-2 w-full text-left text-sm bg-red-700 text-white hover:bg-red-500 transition-all"
          >
            <LucideLogOut className="dropdown-icon size-2 mr-1" />
            Logout
          </button> */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="cursor-pointer text-[18px] flex items-center justify-start w-full px-4 py-2 rounded-0 bg-transparent hover:bg-transparent mx-auto  bg-red-700 text-white hover:bg-red-500"
          >
            <LucideLogOut className="dropdown-icon size-2 mr-1" />
            <label className="cursor-pointer text-[14px] font-semibold">
              Logout
            </label>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminUserDropdown;
