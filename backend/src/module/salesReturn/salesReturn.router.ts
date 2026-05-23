import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifySalesReturn } from "./salesReturn.validation";
import { createSalesReturn, deleteSalesReturn, getSalesReturnAll, getSalesReturnById, updateSalesReturn } from "./salesReturn.controller";


const router = Router();

// Create sales return
router.post(
    "/create-sales-return",
    verifySalesReturn,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Sales_Return, Action.create),
    createSalesReturn
);

// Get All sales return
router.get(
    "/get-sales-return-all",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Sales_Return, Action.read),
    getSalesReturnAll
);

// Get sales return by ID
router.get(
    "/get-sales-return/:id",
    verifyJwt,
    verifyPermission(Module.Sales_Return, Action.read),
    getSalesReturnById
);

// Update sales return
router.put(
    "/update-sales-return/:id",
    verifySalesReturn,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Sales_Return, Action.update),
    updateSalesReturn
);

// Delete sales return
router.delete(
    "/delete-sales-return/:id",
    verifyJwt,
    verifyPermission(Module.Sales_Return, Action.delete),
    deleteSalesReturn
);

export default router;
