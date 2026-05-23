import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { VscTriangleLeft } from "react-icons/vsc";
import { LucideLogOut } from "lucide-react";
import { FaSquareCheck } from "react-icons/fa6";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

import { adminNavigationLinks } from "@/components/navigationLinks/adminNavigationLink/adminNavigationLinks";
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
import i18n from "@/utils/i18n";
import isDropDownShow from "@/utils/helper/isDropDownShow";

const AdminSidebarNavigation = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [activeSubSubmenu, setActiveSubSubmenu] = useState<string | null>(null);

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

  const filteredNavigationLinks = adminNavigationLinks
    .map((link) => {
      // Step 1: Filter subLinks if they exist
      const filteredSubLinks = link.subLinks
        ? link.subLinks
          .map((sub) => {
            // Check subSubLinks if they exist
            const filteredSubSubLinks = sub.subSubLinks
              ? sub.subSubLinks.filter((subSub) =>
                isDropDownShow([subSub.key])
              )
              : [];

            // Include subLink if it has filtered subSubLinks or permission on subLink itself
            if (filteredSubSubLinks.length > 0 || isDropDownShow([sub.key])) {
              return {
                ...sub,
                subSubLinks: filteredSubSubLinks,
              };
            }

            return null;
          })
          .filter(Boolean)
        : [];

      // Step 2: Determine if parent should be shown
      const showParent =
        filteredSubLinks.length > 0 || isDropDownShow([link.key]);

      if (!showParent) return null;

      return {
        ...link,
        subLinks: filteredSubLinks.length > 0 ? filteredSubLinks : undefined,
      };
    })
    .filter(Boolean);



  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed h-full pb-16 mt-16 shadow-lg z-40 bg-primary-50 border-r dark:border-border lg:flex flex-col hidden"
    >
      {/* NAVIGATION LINKS */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar pb-4 pt-4 pl-4">
        <ul className="mt-2 space-y-1">
          {filteredNavigationLinks.map((link, index) => {
            if (!link) return null;
            const filteredSubLinks = link.subLinks;

            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="relative"
              >
                {/* MAIN MENU */}
                {!link.subLinks ? (
                  <NavLink
                    to={link.href || "#"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-3 gap-3 text-[14px] font-semibold rounded transition-all w-full justify-between hover:bg-primary hover:text-white dark:hover:bg-gray-700",
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
                  <button
                    onClick={() =>
                      setActiveSubmenu(
                        activeSubmenu === link.key ? null : link.key
                      )
                    }
                    className={cn(
                      "flex items-center px-4 py-3 text-[14px] font-semibold gap-3 rounded transition-all w-full justify-between hover:bg-primary hover:text-white dark:hover:bg-gray-700",
                      activeSubmenu === link.key ? "bg-primary text-white" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon && <link.icon size={20} />}
                      <span>{link.label[i18n.language as "en" | "bn"]}</span>
                    </div>
                    {filteredSubLinks && filteredSubLinks.length > 0 && (
                      <VscTriangleLeft
                        className={`transition-transform ${activeSubmenu === link.key ? "-rotate-90" : ""
                          }`}
                      />
                    )}
                  </button>
                )}

                {/* SUBMENU */}
                <AnimatePresence>
                  {activeSubmenu === link.key &&
                    filteredSubLinks && filteredSubLinks.length > 0 && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-3 border-l border-white/20 overflow-hidden space-y-2 py-1"
                      >
                        {filteredSubLinks.map((subLink, subIndex) => {
                          if (!subLink) return null;
                          const filteredSubSubLinks = subLink.subSubLinks || [];

                          const hasSubSubLinks = filteredSubSubLinks.length > 0;

                          return (
                            <motion.li
                              key={subIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: subIndex * 0.05 }}
                            >
                              {/* Check if subLink has subSubLinks */}
                              {!hasSubSubLinks ? (
                                <NavLink
                                  to={subLink.href || "#"}
                                  className={({ isActive }) =>
                                    cn(
                                      "px-6 py-2 text-sm transition-all flex items-center gap-2 font-semibold",
                                      isActive ? "text-black" : ""
                                    )
                                  }
                                >
                                  {lastSegment === subLink.href ? (
                                    <FaSquareCheck className="text-[20px]" />
                                  ) : (
                                    <MdCheckBoxOutlineBlank className="text-[22px]" />
                                  )}
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
                                    // className="flex items-center w-full px-6 py-2 text-sm justify-between hover:bg-blue-600 dark:hover:bg-gray-700"
                                    className={cn(
                                      "flex items-center px-4 py-3 text-[14px] font-semibold gap-3 rounded transition-all w-full justify-between hover:bg-primary hover:text-white dark:hover:bg-gray-700",
                                      activeSubSubmenu === subLink.key ? "bg-primary text-white" : ""
                                    )}
                                  >
                                    <span>
                                      {
                                        subLink.label[
                                        i18n.language as "en" | "bn"
                                        ]
                                      }
                                    </span>
                                    {filteredSubSubLinks && filteredSubSubLinks.length > 0 && (
                                      <VscTriangleLeft
                                        className={`transition-transform ${activeSubSubmenu === subLink.key ? "-rotate-90" : ""
                                          }`}
                                      />
                                    )}
                                  </button>

                                  {/* SUB-SUBMENU */}
                                  <AnimatePresence>
                                    {activeSubSubmenu === subLink.key &&
                                      hasSubSubLinks && (
                                        <motion.ul
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="ml-2 pt-2 space-y-2 border-l border-white/10"
                                        >
                                          {filteredSubSubLinks.map(
                                            (subSubLink, subSubIndex) => (
                                              <motion.li
                                                key={subSubIndex}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{
                                                  delay: subSubIndex * 0.05,
                                                }}
                                              >
                                                <NavLink
                                                  to={subSubLink.href || "#"}
                                                  className={({ isActive }) =>
                                                    cn(
                                                      "flex items-center gap-2 px-7 py-1 text-sm font-semibold transition-all",
                                                      isActive
                                                        ? "text-black"
                                                        : ""
                                                    )
                                                  }
                                                >
                                                  {lastSegment ===
                                                    subSubLink.href ? (
                                                    <FaSquareCheck className="text-[18px]" />
                                                  ) : (
                                                    <MdCheckBoxOutlineBlank className="text-[20px]" />
                                                  )}
                                                  {
                                                    subSubLink.label[
                                                    i18n.language as
                                                    | "en"
                                                    | "bn"
                                                    ]
                                                  }
                                                </NavLink>
                                              </motion.li>
                                            )
                                          )}
                                        </motion.ul>
                                      )}
                                  </AnimatePresence>
                                </>
                              )}
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* LOGOUT SECTION */}
      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer text-[18px] flex items-center justify-start w-[90%] p-5 rounded-md bg-transparent hover:bg-transparent  my-4 h-8 mx-auto  bg-red-700 text-white hover:bg-red-500"
            >
              <LucideLogOut className="dropdown-icon size-2 mr-1" />
              <label className="cursor-pointer text-[14px] font-semibold">
                Logout
              </label>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out? Logging out will end your
                current session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="btn-destructive-fill">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="hover:bg-primary"
                onClick={handleLogout}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-center text-tertiary-foreground text-xs opacity-75">
          Version: <span className="lowercase">{appConfiguration.version}</span>
        </p>
      </div>
    </motion.aside>
  );
};

export default AdminSidebarNavigation;
