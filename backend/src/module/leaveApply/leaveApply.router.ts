import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyLeaveApply, verifyLeaveApplyUpdate } from "./leaveApply.validation";
import { createLeaveApply, deleteLeaveApply, getLeaveApplyAll, getLeaveApplyById, updateLeaveApply } from "./leaveApply.controller";


const router = Router();

router.post(
    '/create-leave-apply',
    verifyLeaveApply,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Leave_Apply, Action.create),
    createLeaveApply
)
router.get(
    '/get-leave-apply-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Leave_Apply, Action.read),
    getLeaveApplyAll
)
router.get(
    '/get-leave-apply/:id',
    verifyJwt,
    verifyPermission(Module.Leave_Apply, Action.read),
    getLeaveApplyById
)
router.put(
    '/update-leave-apply/:id',
    verifyLeaveApplyUpdate,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Leave_Apply, Action.update),
    updateLeaveApply
)
router.delete(
    '/delete-leave-apply/:id',
    verifyJwt,
    verifyPermission(Module.Leave_Apply, Action.delete),
    deleteLeaveApply
)

export default router;