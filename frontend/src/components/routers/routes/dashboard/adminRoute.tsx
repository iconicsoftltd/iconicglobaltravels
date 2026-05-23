import CreateQuotationPage from "@/components/common/modals/CrateQuotation";
import QuotationViewPage from "@/components/common/modals/QuotationView";
import ViewStaffEmployee from "@/components/common/modals/ViewStaffEmployee";
import AdminHome from "@/pages/dashboard/AdminHome";
import ChangePasswordPage from "@/pages/dashboard/ChangePassword";
import CommingSoonPage from "@/pages/dashboard/CommingSoon";
import CompanyProfilePage from "@/pages/dashboard/Profile";
import ChartOfAccountsReport from "@/pages/dashboard/accounting/ChartOfAccountsReport";
import GroupsList from "@/pages/dashboard/accounting/GroupList";
import LedgersPage from "@/pages/dashboard/accounting/Ledgers";
import ParticularAccountListPage from "@/pages/dashboard/accounting/PerticularAccountList";
import ProfitLoss from "@/pages/dashboard/accounting/ProfitLoss";
import BalanceSheetReport from "@/pages/dashboard/acountingReport/BalanceSheetReport";
import CashInHandReport from "@/pages/dashboard/acountingReport/CashInHandReport";
import GeneralLedgerReport from "@/pages/dashboard/acountingReport/GeneralLedgerReport";
import IncomeStatementReport from "@/pages/dashboard/acountingReport/IncomeStatementReport";
import LedgerReportPage from "@/pages/dashboard/acountingReport/LedgerReportPage";
import OwnerSecurityReport from "@/pages/dashboard/acountingReport/OwnerSecurityReport";
import ProfitLossReport from "@/pages/dashboard/acountingReport/ProfitLossReport";
import PurchaseSummaryReport from "@/pages/dashboard/acountingReport/PurchaseSummaryReport";
import SalesSummaryReport from "@/pages/dashboard/acountingReport/SalesSummaryReport";
import TrialBalancePage from "@/pages/dashboard/acountingReport/TrialBalance";
import TrialBalanceReport from "@/pages/dashboard/acountingReport/TrialBalanceReport";
import BankLogPage from "@/pages/dashboard/audit/BankLog";
import BranchAssignLogPage from "@/pages/dashboard/audit/BranchAssignLog";
import BranchLogPage from "@/pages/dashboard/audit/BranchLog";
import BrandLogPage from "@/pages/dashboard/audit/BrandLog";
import CategoryLogPage from "@/pages/dashboard/audit/CategoryLog";
import ChequeLogPage from "@/pages/dashboard/audit/ChequeLog";
import ColorLogPage from "@/pages/dashboard/audit/ColorLog";
import DepartmentLogPage from "@/pages/dashboard/audit/DepartmentLog";
import DesignationLogPage from "@/pages/dashboard/audit/DesignationLog";
import EmployeeLogPage from "@/pages/dashboard/audit/EmployeeLog";
import LeaveApplyLogPage from "@/pages/dashboard/audit/LeaveApplyLog";
import LeaveDaySetupLogPage from "@/pages/dashboard/audit/LeaveDaySetupLog";
import ProductLogPage from "@/pages/dashboard/audit/ProductLog";
import ProductVariationLogPage from "@/pages/dashboard/audit/ProductVariationLog";
import PurchaseLogPage from "@/pages/dashboard/audit/PurchaseLog";
import PurchaseReturnLogPage from "@/pages/dashboard/audit/PurchaseReturnLog";
import QuotationLogPage from "@/pages/dashboard/audit/QuotationLog";
import RoleLogPage from "@/pages/dashboard/audit/RoleLog";
import SalaryLogPage from "@/pages/dashboard/audit/SalaryLog";
import SalaryStructureLogPage from "@/pages/dashboard/audit/SalaryStructureLog";
import SalesLogPage from "@/pages/dashboard/audit/SalesLog";
import SalesReturnLogPage from "@/pages/dashboard/audit/SalesReturnLog";
import ServiceLogPage from "@/pages/dashboard/audit/ServiceLog";
import ServiceSalesLogPage from "@/pages/dashboard/audit/ServiceSalesLog";
import SizeLogPage from "@/pages/dashboard/audit/SizeLog";
import SubCategoryLogPage from "@/pages/dashboard/audit/SubCategoryLog";
import UnitLogPage from "@/pages/dashboard/audit/UnitLog";
import UserLogPage from "@/pages/dashboard/audit/UserLog";
import VoucherLogPage from "@/pages/dashboard/audit/VoucherLog";
import BranchList from "@/pages/dashboard/branch/BranchList";
import BranchAssignList from "@/pages/dashboard/branchAssign/BranchAssignList";
import BankList from "@/pages/dashboard/chequeManager/BankList";
import ChequeList from "@/pages/dashboard/chequeManager/ChequeList";
import CrmDashboardPage from "@/pages/dashboard/crm/crmDashboard/CrmDashboard";
import PendingCallListPage from "@/pages/dashboard/crm/pendingCall/PendingCall";
import PendingCallViewPage from "@/pages/dashboard/crm/pendingCall/PendingCallView";
import CrmReportingPage from "@/pages/dashboard/crm/report/CrmReporting";
import CrmReportingListPage from "@/pages/dashboard/crm/report/CrmReportingList";
import TodaysCallListPage from "@/pages/dashboard/crm/todaysCall/TodaysCall";
import TodaysCallViewPage from "@/pages/dashboard/crm/todaysCall/TodaysCallView";
import TodaysFollowUpPage from "@/pages/dashboard/crm/todaysFollowUp/TodaysFollowUp";
import DepartmentList from "@/pages/dashboard/department/DepartmentList";
import DesignationList from "@/pages/dashboard/designation/DesignationList";
import InventoryReportPage from "@/pages/dashboard/inventory/inventory-report/InventoryReportPage";
import LeaveApplyList from "@/pages/dashboard/inventory/leave/LeaveApplyList";
import LeaveDaySetupList from "@/pages/dashboard/inventory/leave/LeaveDaySetupList";
import CreateEditPurchaseForm from "@/pages/dashboard/inventory/purchase/CreateEditPurchase";
import CreateEditPurchaseReturnForm from "@/pages/dashboard/inventory/purchase/CreateEditPurchaseReturn";
import PurchaseList from "@/pages/dashboard/inventory/purchase/PurchaseList";
import PurchaseReturn from "@/pages/dashboard/inventory/purchase/PurchaseReturn";
import CreateEditQuotation from "@/pages/dashboard/inventory/quotation/CreateEditQuotation";
import QuotationList from "@/pages/dashboard/inventory/quotation/QuotationList";
import SalaryStructure from "@/pages/dashboard/inventory/salary/SalaryStructure";
import CreateEditSales from "@/pages/dashboard/inventory/sales/CreateEditSales";
import CreateEditSalesReturn from "@/pages/dashboard/inventory/sales/CreateEditSalesReturn";
import SalesList from "@/pages/dashboard/inventory/sales/SalesList";
import SalesReturnList from "@/pages/dashboard/inventory/sales/SalesReturnList";
import ServiceList from "@/pages/dashboard/inventory/service/ServiceList";
import CreateEditServiceSales from "@/pages/dashboard/inventory/serviceSales/CreateEditServiceSales";
import ServiceSalesList from "@/pages/dashboard/inventory/serviceSales/ServiceSalesList";
import BrandsPage from "@/pages/dashboard/productManagement/brand/BrandsPage";
import CategoryList from "@/pages/dashboard/productManagement/category/CategoryList";
import ColorsPage from "@/pages/dashboard/productManagement/color/ColorsPage";
import ProductsPage from "@/pages/dashboard/productManagement/product/ProductsPage";
import ProductVariationsPage from "@/pages/dashboard/productManagement/productVariation/ProductVariationsPage";
import SizesPage from "@/pages/dashboard/productManagement/size/SizesPage";
import SubCategoryList from "@/pages/dashboard/productManagement/subCategory/SubCategoryList";
import UnitsPage from "@/pages/dashboard/productManagement/unit/UnitsPage";
import RoleList from "@/pages/dashboard/role/RoleList";
import CreateServiceSalePage from "@/pages/dashboard/service/CrateServiceSale";
import ServiceSaleListPage from "@/pages/dashboard/service/ServiceSaleList";
import EmployeeSalaryList from "@/pages/dashboard/staffEmployee/EmployeeSalaryList";
import StaffEmployeeList from "@/pages/dashboard/staffEmployee/StaffEmployeeList";
import UserList from "@/pages/dashboard/user/UserList";
import ContraVoucherList from "@/pages/dashboard/voucher/contraVoucher/ContraVoucherList";
import CreateContraVoucher from "@/pages/dashboard/voucher/contraVoucher/CreateContraVoucher";
import EditContraVoucher from "@/pages/dashboard/voucher/contraVoucher/EditContraVoucher";
import ViewSingleContraVoucher from "@/pages/dashboard/voucher/contraVoucher/ViewSingleContraVoucher";
import CreateExpanseVoucher from "@/pages/dashboard/voucher/expanseVoucher/CreateExpanseVoucher";
import EditExpenseVoucher from "@/pages/dashboard/voucher/expanseVoucher/EditExpenseVoucher";
import ExpanseVoucherList from "@/pages/dashboard/voucher/expanseVoucher/ExpanseVoucherList";
import ViewSingleExpanseVoucher from "@/pages/dashboard/voucher/expanseVoucher/ViewSingleExpanseVoucher";
import CreateJournalVoucher from "@/pages/dashboard/voucher/journalVoucher/CreateJournalVoucher";
import EditJournalVoucher from "@/pages/dashboard/voucher/journalVoucher/EditJournalVoucher";
import JournalVoucherList from "@/pages/dashboard/voucher/journalVoucher/JournalVoucherList";
import ViewSingleJournalVoucher from "@/pages/dashboard/voucher/journalVoucher/ViewSingleJournalVoucher";
import CreatePaymentVoucher from "@/pages/dashboard/voucher/paymentVoucher/CreatePaymentVoucher";
import EditPaymentVoucher from "@/pages/dashboard/voucher/paymentVoucher/EditPaymentVoucher";
import PaymentVoucherList from "@/pages/dashboard/voucher/paymentVoucher/PaymentVoucherList";
import ViewSinglePaymentVoucherList from "@/pages/dashboard/voucher/paymentVoucher/ViewSinglePaymentVoucherList";
import CreateReceiptVoucherList from "@/pages/dashboard/voucher/receiptVucher/CreateReceiptVoucherList";
import EditVoucher from "@/pages/dashboard/voucher/receiptVucher/EditVoucher";
import ReceiptVoucherList from "@/pages/dashboard/voucher/receiptVucher/ReceiptVoucherList";
import ViewSingleReceiptVoucherList from "@/pages/dashboard/voucher/receiptVucher/ViewSingleReceiptVoucherList";
import { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute"; // ✅ import

export interface IRouteProps {
  path: string;
  element: ReactNode;
  loader?: any;
}

export const adminRoutes: IRouteProps[] = [
  // ===================== Dashboard =====================
  { path: "", element: <AdminHome /> },
  { path: "admin_home", element: <AdminHome /> },
  { path: "profile", element: <CompanyProfilePage /> },
  { path: "admin-change-password", element: <ChangePasswordPage /> },

  // ===================== Branch =====================
  {
    path: "branch-list",
    element: (
      <ProtectedRoute module="Branch">
        <BranchList />
      </ProtectedRoute>
    ),
  },
  {
    path: "Branch_Assign",
    element: (
      <ProtectedRoute module="Branch_Assign">
        <BranchAssignList />
      </ProtectedRoute>
    ),
  },

  // ===================== User =====================
  {
    path: "user",
    element: (
      <ProtectedRoute module="User">
        <UserList />
      </ProtectedRoute>
    ),
  },

  // ===================== Voucher =====================
  // Receipt
  {
    path: "receipt-voucher",
    element: (
      <ProtectedRoute module="Receipt_Voucher">
        <ReceiptVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-receipt-voucher",
    element: (
      <ProtectedRoute module="Receipt_Voucher" action="create">
        <CreateReceiptVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "view-receipt-voucher/:id",
    element: (
      <ProtectedRoute module="Receipt_Voucher">
        <ViewSingleReceiptVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "edit-receipt-voucher/:id",
    element: (
      <ProtectedRoute module="Receipt_Voucher" action="update">
        <EditVoucher />
      </ProtectedRoute>
    ),
  },

  // Payment
  {
    path: "payment-voucher",
    element: (
      <ProtectedRoute module="Payment_Voucher">
        <PaymentVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-payment-voucher",
    element: (
      <ProtectedRoute module="Payment_Voucher" action="create">
        <CreatePaymentVoucher />
      </ProtectedRoute>
    ),
  },
  {
    path: "view-payment-voucher/:id",
    element: (
      <ProtectedRoute module="Payment_Voucher">
        <ViewSinglePaymentVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "edit-payment-voucher/:id",
    element: (
      <ProtectedRoute module="Payment_Voucher" action="update">
        <EditPaymentVoucher />
      </ProtectedRoute>
    ),
  },

  // Contra
  {
    path: "contra-voucher",
    element: (
      <ProtectedRoute module="Contra_Voucher">
        <ContraVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-contra-voucher",
    element: (
      <ProtectedRoute module="Contra_Voucher" action="create">
        <CreateContraVoucher />
      </ProtectedRoute>
    ),
  },
  {
    path: "view-contra-voucher/:id",
    element: (
      <ProtectedRoute module="Contra_Voucher">
        <ViewSingleContraVoucher />
      </ProtectedRoute>
    ),
  },
  {
    path: "edit-contra-voucher/:id",
    element: (
      <ProtectedRoute module="Contra_Voucher" action="update">
        <EditContraVoucher />
      </ProtectedRoute>
    ),
  },

  // Journal
  {
    path: "journal-voucher",
    element: (
      <ProtectedRoute module="Journal_Voucher">
        <JournalVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-journal-voucher",
    element: (
      <ProtectedRoute module="Journal_Voucher" action="create">
        <CreateJournalVoucher />
      </ProtectedRoute>
    ),
  },
  {
    path: "view-journal-voucher/:id",
    element: (
      <ProtectedRoute module="Journal_Voucher">
        <ViewSingleJournalVoucher />
      </ProtectedRoute>
    ),
  },
  {
    path: "edit-journal-voucher/:id",
    element: (
      <ProtectedRoute module="Journal_Voucher" action="update">
        <EditJournalVoucher />
      </ProtectedRoute>
    ),
  },

  // Expense
  {
    path: "expanse-voucher",
    element: (
      <ProtectedRoute module="Expense_Voucher">
        <ExpanseVoucherList />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-expanse-voucher",
    element: (
      <ProtectedRoute module="Expense_Voucher" action="create">
        <CreateExpanseVoucher />
      </ProtectedRoute>
    ),
  },
  {
    path: "view-expanse-voucher/:id",
    element: (
      <ProtectedRoute module="Expense_Voucher">
        <ViewSingleExpanseVoucher />
      </ProtectedRoute>
    ),
  },
  {
    path: "edit-expanse-voucher/:id",
    element: (
      <ProtectedRoute module="Expense_Voucher" action="update">
        <EditExpenseVoucher />
      </ProtectedRoute>
    ),
  },

  // ===================== Accounting =====================
  {
    path: "accounting-groups",
    element: (
      <ProtectedRoute module="Group">
        <GroupsList />
      </ProtectedRoute>
    ),
  },
  {
    path: "accounting-ledgers",
    element: (
      <ProtectedRoute module="Ledger">
        <LedgersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "accounting-particulars",
    element: (
      <ProtectedRoute module="Particular">
        <ParticularAccountListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "accounting-chart-of-account",
    element: (
      <ProtectedRoute module="Chart_Of_Account">
        <ChartOfAccountsReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-balance-sheet",
    element: (
      <ProtectedRoute module="Balance_Sheet">
        <BalanceSheetReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-income-statement",
    element: (
      <ProtectedRoute module="Income_Statement">
        <IncomeStatementReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-owner-security",
    element: (
      <ProtectedRoute module="Owner_Security">
        <OwnerSecurityReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-general-ledger",
    element: (
      <ProtectedRoute module="General_Ledger">
        <GeneralLedgerReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-purchase-summary",
    element: (
      <ProtectedRoute module="Report">
        <PurchaseSummaryReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-sales-summary",
    element: (
      <ProtectedRoute module="Report">
        <SalesSummaryReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-cash-in-hand",
    element: (
      <ProtectedRoute module="Report">
        <CashInHandReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-trial-balance",
    element: (
      <ProtectedRoute module="Trial_Balance">
        <TrialBalanceReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "ledger-report-on",
    element: (
      <ProtectedRoute module="General_Ledger">
        <LedgerReportPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "report-profit-and-loss",
    element: (
      <ProtectedRoute module="Profit_And_Loss">
        <ProfitLossReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "accounting-profit-loss",
    element: (
      <ProtectedRoute module="Profit_Loss">
        <ProfitLoss />
      </ProtectedRoute>
    ),
  },
  { path: "accounting-trial-balance", element: <CommingSoonPage /> },
  { path: "accounting-general-ledger", element: <CommingSoonPage /> },
  { path: "accounting-second-general-ledger", element: <CommingSoonPage /> },
  { path: "accounting-voucher-ledger", element: <CommingSoonPage /> },
  {
    path: "trial-balance",
    element: (
      <ProtectedRoute module="Trial_Balance">
        <TrialBalancePage />
      </ProtectedRoute>
    ),
  },

  // ===================== Service =====================
  {
    path: "service-sale",
    element: (
      <ProtectedRoute module="Service_Sales">
        <ServiceSaleListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-service-sale",
    element: (
      <ProtectedRoute module="Service_Sales" action="create">
        <CreateServiceSalePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "service-sales-list",
    element: (
      <ProtectedRoute module="Service_Sales">
        <ServiceSalesList />
      </ProtectedRoute>
    ),
  },
  {
    path: "service-sales",
    element: (
      <ProtectedRoute module="Service_Sales" action="create">
        <CreateEditServiceSales />
      </ProtectedRoute>
    ),
  },

  // ===================== Staff & User =====================
  {
    path: "staff-employee",
    element: (
      <ProtectedRoute module="Employee">
        <StaffEmployeeList />
      </ProtectedRoute>
    ),
  },
  {
    path: "staff-employee/:id",
    element: (
      <ProtectedRoute module="Employee">
        <ViewStaffEmployee />
      </ProtectedRoute>
    ),
  },
  {
    path: "user-role",
    element: (
      <ProtectedRoute module="Role">
        <RoleList />
      </ProtectedRoute>
    ),
  },
  {
    path: "user-department",
    element: (
      <ProtectedRoute module="Department">
        <DepartmentList />
      </ProtectedRoute>
    ),
  },
  {
    path: "user-designation",
    element: (
      <ProtectedRoute module="Designation">
        <DesignationList />
      </ProtectedRoute>
    ),
  },

  // ===================== Inventory =====================
  {
    path: "unit-list",
    element: (
      <ProtectedRoute module="Unit">
        <UnitsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "size-list",
    element: (
      <ProtectedRoute module="Size">
        <SizesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "color-list",
    element: (
      <ProtectedRoute module="Color">
        <ColorsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "product-list",
    element: (
      <ProtectedRoute module="Product">
        <ProductsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "product-variation-list",
    element: (
      <ProtectedRoute module="Product_Variation">
        <ProductVariationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "brand-list",
    element: (
      <ProtectedRoute module="Brand">
        <BrandsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "category-list",
    element: (
      <ProtectedRoute module="Category">
        <CategoryList />
      </ProtectedRoute>
    ),
  },
  {
    path: "subCategory-list",
    element: (
      <ProtectedRoute module="SubCategory">
        <SubCategoryList />
      </ProtectedRoute>
    ),
  },
  {
    path: "purchase",
    element: (
      <ProtectedRoute module="Purchase">
        <PurchaseList />
      </ProtectedRoute>
    ),
  },
  {
    path: "purchase-return",
    element: (
      <ProtectedRoute module="Purchase_Return">
        <PurchaseReturn />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-purchase",
    element: (
      <ProtectedRoute module="Purchase" action="create">
        <CreateEditPurchaseForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-purchase-return",
    element: (
      <ProtectedRoute module="Purchase_Return" action="create">
        <CreateEditPurchaseReturnForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "sales-return",
    element: (
      <ProtectedRoute module="Sales_Return">
        <SalesReturnList />
      </ProtectedRoute>
    ),
  },
  {
    path: "create-sales-return",
    element: (
      <ProtectedRoute module="Sales_Return" action="create">
        <CreateEditSalesReturn />
      </ProtectedRoute>
    ),
  },
  {
    path: "sales-list",
    element: (
      <ProtectedRoute module="Sales">
        <SalesList />
      </ProtectedRoute>
    ),
  },
  {
    path: "sales",
    element: (
      <ProtectedRoute module="Sales" action="create">
        <CreateEditSales />
      </ProtectedRoute>
    ),
  },
  {
    path: "quotation-list",
    element: (
      <ProtectedRoute module="Quotation">
        <QuotationList />
      </ProtectedRoute>
    ),
  },
  {
    path: "quotation",
    element: (
      <ProtectedRoute module="Quotation" action="create">
        <CreateEditQuotation />
      </ProtectedRoute>
    ),
  },
  {
    path: "leave-apply",
    element: (
      <ProtectedRoute module="Leave_Apply">
        <LeaveApplyList />
      </ProtectedRoute>
    ),
  },
  {
    path: "leave-day-setup",
    element: (
      <ProtectedRoute module="Leave_Day_Setup">
        <LeaveDaySetupList />
      </ProtectedRoute>
    ),
  },
  {
    path: "salary-structure",
    element: (
      <ProtectedRoute module="Salary_Structure">
        <SalaryStructure />
      </ProtectedRoute>
    ),
  },
  {
    path: "employee-salary",
    element: (
      <ProtectedRoute module="Salary">
        <EmployeeSalaryList />
      </ProtectedRoute>
    ),
  },
  {
    path: "service-list",
    element: (
      <ProtectedRoute module="Service">
        <ServiceList />
      </ProtectedRoute>
    ),
  },
  {
    path: "inventory-report",
    element: (
      <ProtectedRoute module="Report">
        <InventoryReportPage />
      </ProtectedRoute>
    ),
  },

  // ===================== Payroll =====================
  { path: "payroll-salary-structure", element: <CommingSoonPage /> },
  { path: "payroll-employee-payment", element: <CommingSoonPage /> },
  { path: "payroll-attendance", element: <CommingSoonPage /> },
  { path: "payroll-leave-setup", element: <CommingSoonPage /> },
  { path: "payroll-leave-apply", element: <CommingSoonPage /> },
  { path: "payroll-leave-apply-list", element: <CommingSoonPage /> },

  // ===================== Audit Log =====================
  {
    path: "branch-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <BranchLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "department-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <DepartmentLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "designation-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <DesignationLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "voucher-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <VoucherLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "cheque-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <ChequeLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "employee-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <EmployeeLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "role-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <RoleLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "user-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <UserLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "branch-assign-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <BranchAssignLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "bank-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <BankLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "category-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <CategoryLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "sub-category-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <SubCategoryLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "unit-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <UnitLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "brand-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <BrandLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "product-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <ProductLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "size-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <SizeLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "color-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <ColorLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "product-variation-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <ProductVariationLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "purchase-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <PurchaseLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "purchase-return-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <PurchaseReturnLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "sales-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <SalesLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "sales-return-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <SalesReturnLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "quotation-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <QuotationLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "service-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <ServiceLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "service-sales-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <ServiceSalesLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "leave-apply-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <LeaveApplyLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "leave-day-setup-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <LeaveDaySetupLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "salary-structure-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <SalaryStructureLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "salary-audit",
    element: (
      <ProtectedRoute module="Audit_Log">
        <SalaryLogPage />
      </ProtectedRoute>
    ),
  },

  // ===================== Quotation =====================
  {
    path: "quotation-create",
    element: (
      <ProtectedRoute module="Quotation" action="create">
        <CreateQuotationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "quotation-view",
    element: (
      <ProtectedRoute module="Quotation">
        <QuotationViewPage />
      </ProtectedRoute>
    ),
  },

  // ===================== Reports =====================
  {
    path: "report",
    element: (
      <ProtectedRoute module="Report">
        <CommingSoonPage />
      </ProtectedRoute>
    ),
  },

  // ===================== Settings =====================
  { path: "settings", element: <CommingSoonPage /> },
  { path: "access-setup", element: <CommingSoonPage /> },

  // ===================== CRM =====================
  {
    path: "crm-dashboard",
    element: (
      <ProtectedRoute module="CRM_Dashboard">
        <CrmDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "todays-call",
    element: (
      <ProtectedRoute module="Todays_Call">
        <TodaysCallListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "todays-call/:id",
    element: (
      <ProtectedRoute module="Todays_Call">
        <TodaysCallViewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "pending-call",
    element: (
      <ProtectedRoute module="Pending_Call">
        <PendingCallListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "pending-call/:id",
    element: (
      <ProtectedRoute module="Pending_Call">
        <PendingCallViewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "todays-follow-up",
    element: (
      <ProtectedRoute module="Todays_Follow_Up">
        <TodaysFollowUpPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "crm-reporting",
    element: (
      <ProtectedRoute module="CRM_Reporting">
        <CrmReportingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "crm-reporting/project-wise-report",
    element: (
      <ProtectedRoute module="CRM_Reporting">
        <CrmReportingListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "crm-reporting/lead-status-wise-report",
    element: (
      <ProtectedRoute module="CRM_Reporting">
        <CrmReportingListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "crm-reporting/lead-source-wise-report",
    element: (
      <ProtectedRoute module="CRM_Reporting">
        <CrmReportingListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "crm-reporting/assign-user-wise-report",
    element: (
      <ProtectedRoute module="CRM_Reporting">
        <CrmReportingListPage />
      </ProtectedRoute>
    ),
  },

  // ===================== Cheque Manager =====================
  {
    path: "bank",
    element: (
      <ProtectedRoute module="Bank">
        <BankList />
      </ProtectedRoute>
    ),
  },
  {
    path: "cheque",
    element: (
      <ProtectedRoute module="Cheque">
        <ChequeList />
      </ProtectedRoute>
    ),
  },
];
