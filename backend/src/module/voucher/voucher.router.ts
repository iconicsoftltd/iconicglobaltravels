import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyVoucher } from "./voucher.validation";
import { createVoucher, deleteVoucher, getAllVouchers, getVoucherById, updateVoucher } from "./voucher.controller";


const router = Router();

router.post(
    '/create-voucher',
    verifyVoucher,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Voucher, Action.create),
    createVoucher
)
router.get(
    '/get-voucher-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Voucher, Action.read),
    getAllVouchers
)
router.get(
    '/get-voucher/:id',
    verifyJwt,
    verifyPermission(Module.Voucher, Action.read),
    getVoucherById
)
router.put(
    '/update-voucher/:id',
    verifyVoucher,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Voucher, Action.update),
    updateVoucher
)
router.delete(
    '/delete-voucher/:id',
    verifyJwt,
    verifyPermission(Module.Voucher, Action.delete),
    deleteVoucher
)

export default router;