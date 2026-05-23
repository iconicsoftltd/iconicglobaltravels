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
  createSale,
  deleteSale,
  getSalesAll,
  getSalesById,
  getSalesByInvoice,
  updateSale,
} from "./sales.controller";
import { verifySales } from "./sales.validation";

const router = Router();

// Create sales
router.post(
  "/create-sales",
  verifySales,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Sales, Action.create),
  createSale,
);

// Get All sales
router.get(
  "/get-sales-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Sales, Action.read),
  getSalesAll,
);

// Get sales by ID
router.get(
  "/get-sales/:id",
  verifyJwt,
  verifyPermission(Module.Sales, Action.read),
  getSalesById,
);
// Get sales by Invoice
router.get(
  "/get-sales-invoice/:id",
  verifyJwt,
  verifyPermission(Module.Sales, Action.read),
  getSalesByInvoice,
);

// Update sales
router.put(
  "/update-sales/:id",
  verifySales,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Sales, Action.update),
  updateSale,
);

// Delete sales
router.delete(
  "/delete-sales/:id",
  verifyJwt,
  verifyPermission(Module.Sales, Action.delete),
  deleteSale,
);

export default router;
