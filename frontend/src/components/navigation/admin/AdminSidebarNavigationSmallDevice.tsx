import { useState } from "react";
import { adminNavigationLinks } from "@/components/navigationLinks/adminNavigationLink/adminNavigationLinks";
import { IoClose } from "react-icons/io5";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { VscTriangleLeft } from "react-icons/vsc";
import { FaSquareCheck } from "react-icons/fa6";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { LucideLogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appConfiguration } from "@/utils/constant/appConfiguration";
import { shareWithCookies } from "@/utils/helper/shareWithCookies";
import { shareWithLocal } from "@/utils/helper/shareWithLocal";
import { useSelector } from "react-redux";
import { selectUser } from "@/components/store/store";
import i18n from "@/utils/i18n";

export default function AdminSidebarNavigationSmallDevice({
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (value: boolean) => void;
}) {
  const location = useLocation();

  // Split the pathname by '/' and get the last non-empty segment
  const segments = location.pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [activeSubSubmenu, setActiveSubSubmenu] = useState<string | null>(null);
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    shareWithCookies("remove", `${appConfiguration.appCode}token`);
    shareWithLocal("remove", `${appConfiguration.appCode}user`);
    navigate("/admin-login", { replace: true });
    window.location.reload();
  };

  const filteredNavigationLinks = adminNavigationLinks.filter(() => {
    if (user?.role?.toLowerCase() !== "user") return true;
    return false;
  });

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="absolute left-0 top-0 h-full w-[280px] bg-primary-50 shadow-xl flex flex-col border-r"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b">
              <h1 className="text-lg font-semibold text-gray-800">
                Accounts
              </h1>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-gray-700 text-2xl focus:outline-none"
              >
                <IoClose />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
              <ul className="space-y-1 mx-4">
                {filteredNavigationLinks.map((link, index) => (
                  <li key={index} className="relative">
                    {!link.subLinks ? (
                      <NavLink
                        to={link.href || "#"}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-between px-4 py-3 text-sm font-medium rounded hover:bg-primary hover:text-white transition-all",
                            isActive ? "bg-primary text-white" : ""
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          {link.icon && <link.icon size={20} />}
                          <span>{link.label[i18n.language as "en" | "bn"]}</span>
                        </div>
                      </NavLink>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            setActiveSubmenu(
                              activeSubmenu === link.key ? null : link.key
                            )
                          }
                          className={cn(
                            "flex items-center justify-between w-full px-4 py-3 rounded hover:bg-primary hover:text-white transition-all",
                            activeSubmenu === link.key
                              ? "bg-primary text-white"
                              : ""
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {link.icon && <link.icon size={20} />}
                            <span>{link.label[i18n.language as "en" | "bn"]}</span>
                          </div>
                          <VscTriangleLeft
                            className={`transition-transform ${
                              activeSubmenu === link.key ? "-rotate-90" : ""
                            }`}
                          />
                        </button>

                        {/* Submenu */}
                        <AnimatePresence>
                          {activeSubmenu === link.key && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="ml-2 pt-1 border-gray-300/40 overflow-hidden space-y-1"
                            >
                              {link.subLinks.map((subLink, subIndex) => (
                                <li key={subIndex}>
                                  {!subLink.subSubLinks ? (
                                    <NavLink
                                      to={subLink.href || "#"}
                                      onClick={() =>
                                        setMobileSidebarOpen(false)
                                      }
                                      className={({ isActive }) =>
                                        cn(
                                          "flex items-center gap-2 px-6 py-2 text-sm font-medium hover:bg-primary/10 rounded transition-all",
                                          isActive
                                            ? "text-primary font-semibold"
                                            : "text-gray-700"
                                        )
                                      }
                                    >
                                      {
                                        lastSegment === subLink.href ?
                                          <span className="text-[20px]"><FaSquareCheck /></span>
                                          : <span className="text-[22px]"><MdCheckBoxOutlineBlank /></span>

                                      }
                                     {subLink.label[i18n.language as "en" | "bn"]}
                                    </NavLink>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() =>
                                          setActiveSubSubmenu(
                                            activeSubSubmenu === subLink.key
                                              ? null
                                              : subLink.key
                                          )
                                        }
                                        className="flex items-center justify-between w-full px-6 py-2 text-sm font-medium hover:bg-primary/10 rounded"
                                      >
                                        <span> {subLink.label[
                                            i18n.language as "en" | "bn"
                                          ]}</span>
                                        <FiChevronDown
                                          className={`transition-transform ${activeSubSubmenu === subLink.key
                                            ? "rotate-180"
                                            : ""
                                            }`}
                                        />
                                      </button>

                                      <AnimatePresence>
                                        {activeSubSubmenu === subLink.key && (
                                          <motion.ul
                                            initial={{
                                              height: 0,
                                              opacity: 0,
                                            }}
                                            animate={{
                                              height: "auto",
                                              opacity: 1,
                                            }}
                                            exit={{
                                              height: 0,
                                              opacity: 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="ml-4 border-l border-gray-200 pl-3 space-y-1"
                                          >
                                            {subLink.subSubLinks.map(
                                              (subSubLink, subSubIndex) => (
                                                <li key={subSubIndex}>
                                                  <NavLink
                                                    to={
                                                      subSubLink.href || "#"
                                                    }
                                                    onClick={() =>
                                                      setMobileSidebarOpen(
                                                        false
                                                      )
                                                    }
                                                    className={({ isActive }) =>
                                                      cn(
                                                        "block px-4 py-1 text-sm hover:bg-primary/10 rounded",
                                                        isActive
                                                          ? "text-primary font-semibold"
                                                          : "text-gray-700"
                                                      )
                                                    }
                                                  >
                                                    {
                                                      subSubLink.label[
                                                        i18n.language as "en" | "bn"
                                                      ]
                                                    }
                                                  </NavLink>
                                                </li>
                                              )
                                            )}
                                          </motion.ul>
                                        )}
                                      </AnimatePresence>
                                    </>
                                  )}
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout Section */}
            <div className="border-t p-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <LucideLogOut className="size-4" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Logging out will end your current session.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-center text-xs text-gray-500 mt-2">
                Version: {appConfiguration.version}
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
