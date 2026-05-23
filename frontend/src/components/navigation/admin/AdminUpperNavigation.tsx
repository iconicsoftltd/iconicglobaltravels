import { selectUser } from "@/components/store/store";
// import { appConfiguration } from "@/utils/constant/appConfiguration";
import { shareWithCookies } from "@/utils/helper/shareWithCookies";
import { FiMenu } from "react-icons/fi";
// import { IoIosNotificationsOutline } from "react-icons/io";
import { useSelector } from "react-redux";
// import LanguageSelector from "@/components/dashboard/upperNavigation/LanguageSelector";

import AdminUserDropdown from "@/components/dashboard/upperNavigation/AdminUserDropdown";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CurrencySelect from "@/components/dashboard/upperNavigation/CurrencySelect";
import BranchSelector from "@/components/dashboard/upperNavigation/BranchSelector";
import { appConfiguration } from "@/utils/constant/appConfiguration";
import { shareWithLocal } from "@/utils/helper/shareWithLocal";


interface AdminUpperNavigationProps {
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- Notification Icon Component ---
// const NotificationIcon = () => {
//   return (
//     <button className="relative p-2 rounded-full hover:bg-white/20 transition duration-200">
//       <IoIosNotificationsOutline className="w-6 h-6" />
//       {/* Notification Badge (Red Dot) */}
//       <span className="absolute top-2 right-2 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-primary"></span>
//     </button>
//   );
// };

// --- Main Navigation Component ---
export default function AdminUpperNavigation({
  setMobileSidebarOpen,
}: AdminUpperNavigationProps) {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    shareWithCookies("remove", `${appConfiguration.appCode}token`);
    shareWithLocal("remove", `${appConfiguration.appCode}user`);
    shareWithLocal("remove", `currentCurrency`);
    shareWithLocal("remove", `selectedBranch`);
    shareWithCookies("remove", `branchesList`);
    shareWithCookies("remove", `permissionsList`);
    navigate("/admin-login", { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    if (!user?.role) {
      navigate("/admin-login", { replace: true });
    }
  }, [user?.role, navigate]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
        bg-primary text-white px-6 py-3 flex justify-between items-center`}
    >
      {/* Left Section: Notification and Language Selector */}
      <div className="flex items-center gap-4">
        {/* <Link to={"/"} className="flex items-center gap-2"> */}
        {/* <img className="w-16" src={appConfiguration.logo} alt="logo" /> */}
        <span className="text-xl font-bold hidden lg:block">Accounts Admin Portal</span>
        {/* </Link> */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="text-2xl lg:hidden"
        >
          <FiMenu />
        </button>
      </div>

      {/* Right Section: User Dropdown */}
      <div className="flex items-center gap-4 ml-auto
      ">
        <div className="flex items-center gap-4">
          {/* <NotificationIcon /> */}
          <CurrencySelect />
          <BranchSelector />
          {/* <LanguageSelector /> */}
        </div>

        <div className="flex items-center">
          <AdminUserDropdown user={user} handleLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}