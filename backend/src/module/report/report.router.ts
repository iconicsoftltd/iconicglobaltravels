import { Router } from "express";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyJwt } from "../../middleware/verifyJwt";
import {
  Action,
  Module,
  verifyPermission,
} from "../../middleware/verifyPermission";
import {
  balanceSheets,
  CashFlowReport,
  cashInHandReport,
  chartOfAccounts,
  dashboard,
  generalLedger,
  incomeReport,
  ledgerReport,
  ownerSecurityReport,
  profitAndLoss,
  purchaseReport,
  purchaseSummaryReport,
  salesReport,
  salesSummaryReport,
  stockReport,
  TrailBalanceReport,
  trialBalance,
  TrialBalanceReport,
  voucherLedger,
} from "./report.controller";

const router = Router();

router.get(
  "/chart-of-accounts",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Chart_Of_Account, Action.read),
  chartOfAccounts,
);

router.get(
  "/balance-sheet",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Balance_Sheet, Action.read),
  balanceSheets,
);

router.get(
  "/income-statement",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Income_Statement, Action.read),
  incomeReport,
);
router.get(
  "/owner-security",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Owner_Security, Action.read),
  ownerSecurityReport,
);
router.get(
  "/dashboard-statics",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Dashboard, Action.read),
  dashboard,
);
router.get(
  "/voucher-ledger",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Voucher_Ledger, Action.read),
  voucherLedger,
);
router.get(
  "/general-ledger",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.General_Ledger, Action.read),
  generalLedger,
);
router.get(
  "/trial-balance",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Trial_Balance, Action.read),
  trialBalance,
);
router.get(
  "/profit-and-loss",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Profit_And_Loss, Action.read),
  profitAndLoss,
);
router.get(
  "/sales",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Sales, Action.read),
  salesReport,
);
router.get(
  "/sales-summary",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Sales, Action.read),
  salesSummaryReport,
);
router.get(
  "/purchase",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Purchase, Action.read),
  purchaseReport,
);
router.get(
  "/purchase-summary",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Purchase, Action.read),
  purchaseSummaryReport,
);
router.get(
  "/cash-in-hand",
  verifyJwt,
  verifyBranchPermissionGet,
  // verifyPermission(Module.Purchase, Action.read),
  cashInHandReport,
);
router.get(
  "/trail-balance",
  verifyJwt,
  verifyBranchPermissionGet,
  // verifyPermission(Module.Purchase, Action.read),
  TrailBalanceReport,
);
router.get(
  "/trial-balance",
  verifyJwt,
  verifyBranchPermissionGet,
  // verifyPermission(Module.Purchase, Action.read),
  TrialBalanceReport,
);
router.get(
  "/cash-flow",
  verifyJwt,
  verifyBranchPermissionGet,
  // verifyPermission(Module.Purchase, Action.read),
  CashFlowReport,
);
router.get(
  "/stock-information",
  verifyJwt,
  verifyBranchPermissionGet,
  // verifyPermission(Module.Purchase, Action.read),
  stockReport,
);

router.get(
  "/ledger",
  verifyJwt,
  verifyBranchPermissionGet,
  // verifyPermission(Module.Purchase, Action.read),
  ledgerReport,
);

export default router;
