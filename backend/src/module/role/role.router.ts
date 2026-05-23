import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyRole } from "./role.validationt";
import { createRole, deleteRole, getRoleAll, getRoleById, updateRole } from "./role.controller";


const router = Router();

router.post(
    '/create-role',
    verifyRole,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Role, Action.create),
    createRole
)
router.get(
    '/get-role-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Role, Action.read),
    getRoleAll
)
router.get(
    '/get-role/:id',
    verifyJwt,
    verifyPermission(Module.Role, Action.read),
    getRoleById
)
router.put(
    '/update-role/:id',
    verifyRole,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Role, Action.update),
    updateRole
)
router.delete(
    '/delete-role/:id',
    verifyJwt,
    verifyPermission(Module.Role, Action.delete),
    deleteRole
)

export default router;