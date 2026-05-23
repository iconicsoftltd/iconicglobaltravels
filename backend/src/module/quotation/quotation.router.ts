import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyQuotation } from "./quotation.validation";
import { createQuotation, deleteQuotation, getQuotationAll, getQuotationById, updateQuotation } from "./quotation.controller";


const router = Router();

// Create quotation
router.post(
    "/create-quotation",
    verifyQuotation,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Quotation, Action.create),
    createQuotation
);

// Get All quotations
router.get(
    "/get-quotation-all",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Quotation, Action.read),
    getQuotationAll
);

// Get quotation by ID
router.get(
    "/get-quotation/:id",
    verifyJwt,
    verifyPermission(Module.Quotation, Action.read),
    getQuotationById
);


// Update quotation
router.put(
    "/update-quotation/:id",
    verifyQuotation,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Quotation, Action.update),
    updateQuotation
);

// Delete quotation
router.delete(
    "/delete-quotation/:id",
    verifyJwt,
    verifyPermission(Module.Quotation, Action.delete),
    deleteQuotation
);

export default router;
