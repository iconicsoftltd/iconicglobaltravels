import { Router } from "express";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyJwt } from "../../middleware/verifyJwt";
import {
  Action,
  Module,
  verifyPermission,
} from "../../middleware/verifyPermission";
import {
  createPurchase,
  deletePurchase,
  getPurchaseAll,
  getPurchaseById,
  getPurchaseByInvoice,
  updatePurchase,
} from "./purchase.controller";
import { verifyPurchase } from "./purchase.validation";

const router = Router();

// Create purchase
router.post(
  "/create-purchase",
  verifyPurchase,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Purchase, Action.create),
  createPurchase,
);

// Get All purchases
router.get(
  "/get-purchase-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Purchase, Action.read),
  getPurchaseAll,
);

// Get purchase by ID
router.get(
  "/get-purchase/:id",
  verifyJwt,
  verifyPermission(Module.Purchase, Action.read),
  getPurchaseById,
);
// Get purchase by Invoice
router.get(
  "/get-purchase-invoice/:id",
  verifyJwt,
  verifyPermission(Module.Purchase, Action.read),
  getPurchaseByInvoice,
);

// Update purchase
router.put(
  "/update-purchase/:id",
  verifyPurchase,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Purchase, Action.update),
  updatePurchase,
);

// Delete purchase
router.delete(
  "/delete-purchase/:id",
  verifyJwt,
  verifyPermission(Module.Purchase, Action.delete),
  deletePurchase,
);

export default router;
