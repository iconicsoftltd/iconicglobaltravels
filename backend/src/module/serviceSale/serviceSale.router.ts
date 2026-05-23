import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyServiceSales } from "./serviceSale.validation";
import { createServiceSale, deleteServiceSale, getServiceSalesAll, getServiceSalesById, updateServiceSale } from "./serviceSale.controller";


const router = Router();

// Create service sales
router.post(
    "/create-service-sales",
    verifyServiceSales,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Service_Sales, Action.create),
    createServiceSale
);

// Get All service saless
router.get(
    "/get-service-sales-all",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Service_Sales, Action.read),
    getServiceSalesAll
);

// Get service sales by ID
router.get(
    "/get-service-sales/:id",
    verifyJwt,
    verifyPermission(Module.Service_Sales, Action.read),
    getServiceSalesById
);


// Update service sales
router.put(
    "/update-service-sales/:id",
    verifyServiceSales,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Service_Sales, Action.update),
    updateServiceSale
);

// Delete service sales
router.delete(
    "/delete-service-sales/:id",
    verifyJwt,
    verifyPermission(Module.Service_Sales, Action.delete),
    deleteServiceSale
);

export default router;
