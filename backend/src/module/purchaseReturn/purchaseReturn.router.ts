import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyPurchaseReturn } from "./purchaseReturn.validation";
import { createPurchaseReturn, deletePurchaseReturn, getPurchaseReturnAll, getPurchaseReturnById, updatePurchaseReturn } from "./purchaseReturn.controller";


const router = Router();

// Create purchase
router.post(
    "/create-purchase-return",
    verifyPurchaseReturn,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Purchase_Return, Action.create),
    createPurchaseReturn
);

// Get All purchases
router.get(
    "/get-purchase-return-all",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Purchase_Return, Action.read),
    getPurchaseReturnAll
);

// Get purchase by ID
router.get(
    "/get-purchase-return/:id",
    verifyJwt,
    verifyPermission(Module.Purchase_Return, Action.read),
    getPurchaseReturnById
);

// Update purchase
router.put(
    "/update-purchase-return/:id",
    verifyPurchaseReturn,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Purchase_Return, Action.update),
    updatePurchaseReturn
);

// Delete purchase
router.delete(
    "/delete-purchase-return/:id",
    verifyJwt,
    verifyPermission(Module.Purchase_Return, Action.delete),
    deletePurchaseReturn
);

export default router;
