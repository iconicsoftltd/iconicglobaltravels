import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyGroup } from "./group.validation";
import { createGroup, deleteGroup, getGroupAll, getGroupById, updateGroup } from "./group.controller";


const router = Router();

router.post(
    '/create-group',
    verifyGroup,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Group, Action.create),
    createGroup
)
router.get(
    '/get-group-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Group, Action.read),
    getGroupAll
)
router.get(
    '/get-group/:id',
    verifyJwt,
    verifyPermission(Module.Group, Action.read),
    getGroupById
)
router.put(
    '/update-group/:id',
    verifyGroup,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Group, Action.update),
    updateGroup
)
router.delete(
    '/delete-group/:id',
    verifyJwt,
    verifyPermission(Module.Group, Action.delete),
    deleteGroup
)

export default router;