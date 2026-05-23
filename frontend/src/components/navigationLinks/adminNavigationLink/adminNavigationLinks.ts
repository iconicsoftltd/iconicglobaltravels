import { ComponentType } from "react";
import { BiCog, BiUser } from "react-icons/bi";
import { IconType } from "react-icons/lib";
import { LuLandmark, LuLayoutDashboard } from "react-icons/lu";
import { MdBalance, MdOutlineReport } from "react-icons/md";
// import { FaUsers } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { PiSealPercent } from "react-icons/pi";
import {
  //  RiExchangeDollarLine,
  RiFlag2Line,
} from "react-icons/ri";
// import { VscTools } from "react-icons/vsc";
// import { LiaMoneyCheckAltSolid } from "react-icons/lia";
import { AiOutlineAudit } from "react-icons/ai";

type Language = "en" | "bn";

export interface INavigationLinks {
  icon?: IconType | ComponentType<any>;
  label: Record<Language, string>;
  key: string;
  href?: string;
  subLinks?: INavigationLinks[];
  subSubLinks?: INavigationLinks[];
}

export const adminNavigationLinks: INavigationLinks[] = [
  {
    icon: LuLayoutDashboard,
    label: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
    key: "Dashboard",
    href: "admin_home",
  },
  {
    icon: LuLandmark,
    label: { en: "Company", bn: "হিসাবরক্ষণ" },
    key: "Branch",
    subLinks: [
      {
        label: { en: "Company List", bn: "গ্রুপসমূহ" },
        key: "Branch",
        href: "branch-list",
      },
    ],
  },
  {
    icon: BiUser,
    label: { en: "User Management", bn: "ব্যবহারকারী" },
    key: "User_Management",
    subLinks: [
      {
        label: { en: "Department", bn: "বিভাগ" },
        key: "Department",
        href: "user-department",
      },
      {
        label: { en: "Designation", bn: "পদবী" },
        key: "Designation",
        href: "user-designation",
      },
      {
        label: { en: "Staff / Employee", bn: "স্টাফ / কর্মচারী" },
        key: "Employee",
        href: "staff-employee",
      },
      {
        label: { en: "Role", bn: "ব্যবহারকারী / ভূমিকা" },
        key: "Role",
        href: "user-role",
      },
      {
        label: { en: "User", bn: "ব্যবহারকারী / ভূমিকা" },
        key: "User",
        href: "user",
      },
      {
        label: { en: "Company Assign", bn: "গ্রুপসমূহ" },
        key: "Branch_Assign",
        href: "Branch_Assign",
      },
    ],
  },
  {
    icon: MdBalance,
    label: { en: "Accounting", bn: "হিসাবরক্ষণ" },
    key: "accounting",
    subLinks: [
      {
        label: { en: "Groups", bn: "গ্রুপসমূহ" },
        key: "Group",
        href: "accounting-groups",
      },
      {
        label: { en: "Ledgers", bn: "লেজার" },
        key: "Ledger",
        href: "accounting-ledgers",
      },
      {
        label: { en: "Particular", bn: "বিবরণী" },
        key: "Particular",
        href: "accounting-particulars",
      },
      {
        label: { en: "Chart of Account", bn: "অ্যাকাউন্ট চার্ট" },
        key: "Chart_Of_Account",
        href: "accounting-chart-of-account",
      },

      {
        label: { en: "Profit Loss A/C", bn: "লাভ-ক্ষতি হিসাব" },
        key: "profit-loss",
        href: "accounting-profit-loss",
      },
      {
        label: { en: "Trial Balance", bn: "ট্রায়াল ব্যালেন্স" },
        key: "trial-balance",
        href: "accounting-trial-balance",
      },
      {
        label: { en: "General Ledger", bn: "সাধারণ লেজার" },
        key: "general-ledger",
        href: "accounting-general-ledger",
      },
      {
        label: { en: "2nd General Ledger", bn: "দ্বিতীয় সাধারণ লেজার" },
        key: "second-general-ledger",
        href: "accounting-second-general-ledger",
      },
      {
        label: { en: "Voucher Ledger", bn: "ভাউচার লেজার" },
        key: "voucher-ledger",
        href: "accounting-voucher-ledger",
      },
    ],
  },

  {
    icon: PiSealPercent,
    label: { en: "Voucher", bn: "হিসাবরক্ষণ" },
    key: "Voucher",
   subLinks: [
    {
      label: { en: "Receipt Voucher", bn: "গ্রুপসমূহ" },
      key: "Receipt_Voucher", // ✅ আলাদা key
      href: "receipt-voucher",
    },
    {
      label: { en: "Payment Voucher", bn: "গ্রুপসমূহ" },
      key: "Payment_Voucher", // ✅ আলাদা key
      href: "payment-voucher",
    },
    {
      label: { en: "Contra Voucher", bn: "গ্রুপসমূহ" },
      key: "Contra_Voucher", // ✅ আলাদা key
      href: "contra-voucher",
    },
    {
      label: { en: "Journal Voucher", bn: "গ্রুপসমূহ" },
      key: "Journal_Voucher", // ✅ আলাদা key
      href: "journal-voucher",
    },
    {
      label: { en: "Expense Voucher", bn: "গ্রুপসমূহ" },
      key: "Expense_Voucher", // ✅ আলাদা key
      href: "expanse-voucher",
    },
  ],
  },

  {
    icon: RiFlag2Line,
    label: { en: "Accounting Report", bn: "হিসাবরক্ষণ" },
    key: "report",
    subLinks: [
      // {
      //   label: { en: "Voucher Ledger", bn: "ব্যালেন্স শীট" },
      //   key: "Voucher_Ledger",
      //   href: "report-voucher-ledger",
      // },
      {
        label: { en: "Voucher Ledger", bn: "ব্যালেন্স শীট" },
        key: "Voucher_Ledger",
        href: "report-general-ledger",
      },
      // {
      //   label: { en: "Ledger Report", bn: "ব্যালেন্স শীট" },
      //   key: "Trial_Balance",
      //   href: "report-trial-balance",
      // },
      {
        label: { en: "General Ledger", bn: "ব্যালেন্স শীট" },
        key: "General_Ledger",
        href: "ledger-report-on",
      },
      {
        label: { en: "Profit Loss", bn: "ব্যালেন্স শীট" },
        key: "Profit_And_Loss",
        href: "report-profit-and-loss",
      },
      {
        label: { en: "Balance Sheet", bn: "ব্যালেন্স শীট" },
        key: "Balance_Sheet",
        href: "report-balance-sheet",
      },
      {
        label: { en: "Income Statement", bn: "ব্যালেন্স শীট" },
        key: "Income_Statement",
        href: "report-income-statement",
      },
      {
        label: { en: "Owner's Equity", bn: "ব্যালেন্স শীট" },
        key: "Owner_Security",
        href: "report-owner-security",
      },
      {
        label: { en: "Cash In Hand", bn: "ব্যালেন্স শীট" },
        key: "Owner_Security",
        href: "report-cash-in-hand",
      },
      {
        label: { en: "Sales Summary (Tax)", bn: "ব্যালেন্স শীট" },
        key: "Owner_Security",
        href: "report-sales-summary",
      },
      {
        label: { en: "Purchase Summary (Tax)", bn: "ব্যালেন্স শীট" },
        key: "Owner_Security",
        href: "report-purchase-summary",
      },
      {
        label: { en: "Trial Balance", bn: "ব্যালেন্স শীট" },
        key: "Owner_Security",
        href: "trial-balance",
      },
    ],
  },

  // this is commented temporarily, will be uncommented in future *******************
  // {
  //   icon: LiaMoneyCheckAltSolid,
  //   label: { en: "Cheque Manager", bn: "চেক ম্যানেজার" },
  //   key: "ChequeManager",
  //   subLinks: [
  //     {
  //       label: { en: "Bank", bn: "সিআরএম ড্যাশবোর্ড" },
  //       key: "Bank",
  //       href: "bank",
  //     },
  //     {
  //       label: { en: "Cheque", bn: "আজকের কল" },
  //       key: "Cheque",
  //       href: "cheque",
  //     },
  //   ],
  // },

  {
    icon: FiShoppingCart,
    label: { en: "Inventory", bn: "ইনভেন্টরি" },
    key: "Inventory",
    subLinks: [
      {
        label: { en: "Product Management", bn: "পণ্য ব্যবস্থাপনা" },
        key: "ProductManagement",
        href: "product_management",
        subSubLinks: [
          {
            icon: BiUser,
            label: { en: "Category", bn: "ক্যাটাগরি" },
            key: "Category",
            href: "category-list",
          },
          {
            icon: BiUser,
            label: { en: "Sub Category", bn: "সাবক্যাটাগরি" },
            key: "SubCategory",
            href: "subCategory-list",
          },
          {
            icon: BiUser,
            label: { en: "Units", bn: "ইউনিট" },
            key: "Unit",
            href: "unit-list",
          },
          {
            icon: BiUser,
            label: { en: "Brands", bn: "ব্র্যান্ড" },
            key: "Brand",
            href: "brand-list",
          },
          {
            icon: BiUser,
            label: { en: "Products", bn: "পণ্য" },
            key: "Product",
            href: "product-list",
          },
          {
            icon: BiUser,
            label: { en: "Sizes", bn: "সাইজ" },
            key: "Size",
            href: "size-list",
          },
          {
            icon: BiUser,
            label: { en: "Colors", bn: "রং" },
            key: "Color",
            href: "color-list",
          },

          {
            icon: BiUser,
            label: { en: "Product Variations", bn: "পণ্য ভ্যারিয়েশন" },
            key: "Product_Variation",
            href: "product-variation-list",
          },
        ],
      },
      {
        label: { en: "Purchase List", bn: "ভবিষ্যতে" },
        key: "Purchase",
        href: "purchase",
      },
      {
        label: { en: "Purchase Return", bn: "ভবিষ্যতে" },
        key: "Purchase_Return",
        href: "purchase-return",
      },
      {
        label: { en: "Sales List", bn: "ভবিষ্যতে" },
        key: "Sales",
        href: "sales-list",
      },
      {
        label: { en: "Sales Return", bn: "ভবিষ্যতে" },
        key: "Sales_Return",
        href: "sales-return",
      },
      {
        label: { en: "Quotation List", bn: "ভবিষ্যতে" },
        key: "Quotation",
        href: "quotation-list",
      },
      {
        label: { en: "Inventory Report", bn: "ভবিষ্যতে" },
        // key: "Inventory_Report",
        key: "Quotation",
        href: "inventory-report",
      },
    ],
  },

  // this is commented temporarily, will be uncommented in future *******************
  // {
  //   icon: VscTools,
  //   label: { en: "Service", bn: "সার্ভিস" },
  //   key: "Service",
  //   subLinks: [
  //     {
  //       label: { en: "Service List", bn: "সার্ভিস তালিকা" },
  //       key: "Service",
  //       href: "service-list",
  //     },
  //     {
  //       label: { en: "Service Sales List", bn: "সার্ভিস বিক্রয়" },
  //       key: "Service_Sales",
  //       href: "service-sales-list",
  //     },
  //   ],
  // },

  // this is commented temporarily, will be uncommented in future *******************
  // {
  //   icon: RiExchangeDollarLine,
  //   label: { en: "Payroll", bn: "পেরোল" },
  //   key: "payroll",
  //   subLinks: [
  //     {
  //       label: { en: "Leave Apply", bn: "ভবিষ্যতে" },
  //       key: "Leave_Apply",
  //       href: "leave-apply",
  //     },
  //     {
  //       label: { en: "Leave Day Setup", bn: "ভবিষ্যতে" },
  //       key: "Leave_Day_Setup",
  //       href: "leave-day-setup",
  //     },
  //     {
  //       label: { en: "Salary Structure", bn: "ভবিষ্যতে" },
  //       key: "Salary_Structure",
  //       href: "salary-structure",
  //     },
  //     {
  //       label: { en: "Employee Salary", bn: "ভবিষ্যতে" },
  //       key: "Salary",
  //       href: "employee-salary",
  //     },
  //   ],
  // },
  {
    icon: AiOutlineAudit,
    label: { en: "Audit Log", bn: "অডিট লগ" },
    key: "Audit_Log",
    subLinks: [
      {
        label: { en: "Branch Audit", bn: "ব্রাঞ্চ অডিট" },
        key: "Audit_Log",
        href: "branch-audit",
      },
      {
        label: { en: "Department Audit", bn: "ডিপার্টমেন্ট অডিট" },
        key: "Audit_Log",
        href: "department-audit",
      },
      {
        label: { en: "Designation Audit", bn: "ডিজাইনেশন অডিট" },
        key: "Audit_Log",
        href: "designation-audit",
      },
      {
        label: { en: "Voucher Audit", bn: "ভাউচার অডিট" },
        key: "Audit_Log",
        href: "voucher-audit",
      },
      {
        label: { en: "Cheque Audit", bn: "চেক অডিট" },
        key: "Audit_Log",
        href: "cheque-audit",
      },
      {
        label: { en: "Employee Audit", bn: "এমপ্লয়ি অডিট" },
        key: "Audit_Log",
        href: "employee-audit",
      },
      {
        label: { en: "Role Audit", bn: "রোল অডিট" },
        key: "Audit_Log",
        href: "role-audit",
      },
      {
        label: { en: "User Audit", bn: "ইউজার অডিট" },
        key: "Audit_Log",
        href: "user-audit",
      },
      {
        label: { en: "Company Assign Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "branch-assign-audit",
      },
      {
        label: { en: "Bank Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "bank-audit",
      },
      {
        label: { en: "Category Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "category-audit",
      },
      {
        label: { en: "Sub Category Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "sub-category-audit",
      },
      {
        label: { en: "Unit Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "unit-audit",
      },
      {
        label: { en: "Brand Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "brand-audit",
      },
      {
        label: { en: "Product Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "product-audit",
      },
      {
        label: { en: "Size Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "size-audit",
      },
      {
        label: { en: "Color Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "color-audit",
      },
      {
        label: { en: "Product Variation Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "product-variation-audit",
      },
      {
        label: { en: "Purchase Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "purchase-audit",
      },
      {
        label: { en: "Purchase Return Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "purchase-return-audit",
      },
      {
        label: { en: "Sales Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "sales-audit",
      },
      {
        label: { en: "Sales Return Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "sales-return-audit",
      },
      {
        label: { en: "Quotation Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "quotation-audit",
      },
      {
        label: { en: "Service Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "service-audit",
      },
      {
        label: { en: "Service Sales Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "service-sales-audit",
      },
      {
        label: { en: "Leave Apply Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "leave-apply-audit",
      },
      {
        label: { en: "Leave Day Setup Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "leave-day-setup-audit",
      },
      {
        label: { en: "Salary Structure Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "salary-structure-audit",
      },
      {
        label: { en: "Salary Audit", bn: "ব্রাঞ্চ এসাইন অডিট" },
        key: "Audit_Log",
        href: "salary-audit",
      },
    ],
  },

  // this is commented temporarily, will be uncommented in future *******************
  // {
  //   icon: FaUsers,
  //   label: { en: "CRM", bn: "সিআরএম" },
  //   key: "crm",
  //   subLinks: [
  //     {
  //       label: { en: "CRM Dashboard", bn: "সিআরএম ড্যাশবোর্ড" },
  //       key: "crm-dashboard",
  //       href: "crm-dashboard",
  //     },
  //     {
  //       label: { en: "Todays Call", bn: "আজকের কল" },
  //       key: "todays-call",
  //       href: "todays-call",
  //     },
  //     {
  //       label: { en: "Pending Call", bn: "বিচারাধীন কল" },
  //       key: "pending-call",
  //       href: "pending-call",
  //     },
  //     {
  //       label: { en: "Today's Follow-up", bn: "আজকের ফলো-আপ" },
  //       key: "todays-follow-up",
  //       href: "todays-follow-up",
  //     },
  //     {
  //       label: { en: "CRM Reporting", bn: "সিআরএম রিপোর্টিং" },
  //       key: "crm-reporting",
  //       href: "crm-reporting",
  //     },
  //   ],
  // },

  // {
  //   icon: BiSolidQuoteRight,
  //   label: { en: "Quotation", bn: "কোটেশন" },
  //   key: "quotation",
  //   subLinks: [
  //     {
  //       label: { en: "Quotation List", bn: "কোটেশন তালিকা" },
  //       key: "Quotation",
  //       href: "quotation-list",
  //     },
  //     {
  //       label: { en: "Create Quotation", bn: "নতুন কোটেশন" },
  //       key: "create-quotation",
  //       href: "quotation-create",
  //     },
  //   ],
  // },
  {
    icon: MdOutlineReport,
    label: { en: "Report", bn: "রিপোর্ট" },
    key: "report",
    href: "report",
  },
  {
    icon: BiCog,
    label: { en: "Settings", bn: "সেটিংস" },
    key: "settings",
    href: "settings",
  },
  {
    icon: BiCog,
    label: { en: "Access Setup", bn: "অ্যাক্সেস সেটআপ" },
    key: "access-setup",
    href: "access-setup",
  },
];
