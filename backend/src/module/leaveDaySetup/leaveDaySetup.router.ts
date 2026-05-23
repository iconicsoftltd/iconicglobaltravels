import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyLeaveDaySetup } from "./leaveDaySetup.validation";
import { createLeaveDaySetup, deleteLeaveDaySetup, getLeaveDaySetupAll, getLeaveDaySetupById, updateLeaveDaySetup } from "./leaveDaySetup.controller";


const router = Router();

router.post(
    '/create-leave-day-setup',
    verifyLeaveDaySetup,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Leave_Day_Setup, Action.create),
    createLeaveDaySetup
)
router.get(
    '/get-leave-day-setup-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Leave_Day_Setup, Action.read),
    getLeaveDaySetupAll
)
router.get(
    '/get-leave-day-setup/:id',
    verifyJwt,
    verifyPermission(Module.Leave_Day_Setup, Action.read),
    getLeaveDaySetupById
)
router.put(
    '/update-leave-day-setup/:id',
    verifyLeaveDaySetup,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Leave_Day_Setup, Action.update),
    updateLeaveDaySetup
)
router.delete(
    '/delete-leave-day-setup/:id',
    verifyJwt,
    verifyPermission(Module.Leave_Day_Setup, Action.delete),
    deleteLeaveDaySetup
)

export default router;