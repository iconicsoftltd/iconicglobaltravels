import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyUserPermission } from "./userPermission.validation";
import { createUserPermission, getUserPermission } from "./userPermission.controller";


const router = Router();

router.post(
    '/create-user-permission',
    verifyUserPermission,
    verifyJwt,
    verifyPermission(Module.User, Action.create),
    createUserPermission
)
router.get(
    '/get-permission-by-user/:id',
    verifyJwt,
    verifyPermission(Module.User, Action.read),
    getUserPermission
)


export default router;