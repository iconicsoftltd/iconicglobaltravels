import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { getBankLog, getBankLogById, getBranchAssignLog, getBranchAssignLogById, getBranchLog, getBranchLogById, getBrandLog, getBrandLogById, getCategoryLog, getCategoryLogById, getChequeLog, getChequeLogById, getColorLog, getColorLogById, getDepartmentLog, getDepartmentLogById, getDesignationLog, getDesignationLogById, getEmployeeLog, getEmployeeLogById, getLeaveApplyLog, getLeaveApplyLogById, getLeaveDaySetupLog, getLeaveDaySetupLogById, getProductLog, getProductLogById, getProductVariationLog, getProductVariationLogById, getPurchaseLog, getPurchaseLogById, getPurchaseReturnLog, getPurchaseReturnLogById, getQuotationLog, getQuotationLogById, getRoleLog, getRoleLogById, getSalaryLog, getSalaryLogById, getSalaryStructureLog, getSalaryStructureLogById, getSalesLog, getSalesLogById, getSalesReturnLog, getSalesReturnLogById, getServiceLog, getServiceLogById, getServiceSalesLog, getServiceSalesLogById, getSizeLog, getSizeLogById, getSubCategoryLog, getSubCategoryLogById, getUnitLog, getUnitLogById, getUserLog, getUserLogById, getVoucherLog, getVoucherLogById } from "./activityLog.controller";

const router = Router();

router.get(
    "/get-branch-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBranchLog
);

router.get(
    "/get-branch-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBranchLogById
);
router.get(
    "/get-department-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getDepartmentLog
);

router.get(
    "/get-department-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getDepartmentLogById
);
router.get(
    "/get-designation-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getDesignationLog
);

router.get(
    "/get-designation-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getDesignationLogById
);

router.get(
    "/get-voucher-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getVoucherLog
);

router.get(
    "/get-voucher-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getVoucherLogById
);


router.get(
    "/get-cheque-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getChequeLog
);

router.get(
    "/get-cheque-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getChequeLogById
);
router.get(
    "/get-bank-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBankLog
);

router.get(
    "/get-bank-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBankLogById
);

router.get(
    "/get-employee-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getEmployeeLog
);

router.get(
    "/get-employee-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getEmployeeLogById
);

router.get(
    "/get-role-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getRoleLog
);

router.get(
    "/get-role-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getRoleLogById
);

router.get(
    "/get-user-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getUserLog
);

router.get(
    "/get-user-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getUserLogById
);

router.get(
    "/get-branch-assign-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBranchAssignLog
);

router.get(
    "/get-branch-assign-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBranchAssignLogById
);
router.get(
    "/get-category-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getCategoryLog
);

router.get(
    "/get-category-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getCategoryLogById
);
router.get(
    "/get-subcategory-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSubCategoryLog
);

router.get(
    "/get-subcategory-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSubCategoryLogById
);
router.get(
    "/get-unit-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getUnitLog
);

router.get(
    "/get-unit-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getUnitLogById
);
router.get(
    "/get-brand-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBrandLog
);

router.get(
    "/get-brand-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getBrandLogById
);
router.get(
    "/get-product-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getProductLog
);

router.get(
    "/get-product-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getProductLogById
);
router.get(
    "/get-size-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSizeLog
);

router.get(
    "/get-size-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSizeLogById
);

router.get(
    "/get-color-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getColorLog
);

router.get(
    "/get-color-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getColorLogById
);
router.get(
    "/get-product-variation-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getProductVariationLog
);

router.get(
    "/get-product-variation-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getProductVariationLogById
);
router.get(
    "/get-purchase-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getPurchaseLog
);

router.get(
    "/get-purchase-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getPurchaseLogById
);
router.get(
    "/get-purchase-return-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getPurchaseReturnLog
);

router.get(
    "/get-purchase-return-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getPurchaseReturnLogById
);
router.get(
    "/get-sales-return-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalesReturnLog
);

router.get(
    "/get-sales-return-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalesReturnLogById
);
router.get(
    "/get-sales-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalesLog
);

router.get(
    "/get-sales-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalesLogById
);

router.get(
    "/get-quotation-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getQuotationLog
);

router.get(
    "/get-quotation-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getQuotationLogById
);

router.get(
    "/get-service-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getServiceLog
);

router.get(
    "/get-service-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getServiceLogById
);
router.get(
    "/get-service-sales-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getServiceSalesLog
);

router.get(
    "/get-service-sales-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getServiceSalesLogById
);
router.get(
    "/get-leave-apply-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getLeaveApplyLog
);

router.get(
    "/get-leave-apply-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getLeaveApplyLogById
);
router.get(
    "/get-leave-day-setup-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getLeaveDaySetupLog
);

router.get(
    "/get-leave-day-setup-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getLeaveDaySetupLogById
);
router.get(
    "/get-salary-structure-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalaryStructureLog
);

router.get(
    "/get-salary-structure-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalaryStructureLogById
);
router.get(
    "/get-salary-log",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalaryLog
);

router.get(
    "/get-salary-log/:id",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Audit_Log, Action.read),
    getSalaryLogById
);


export default router;