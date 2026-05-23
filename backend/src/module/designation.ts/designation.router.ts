import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { createDesignation, deleteDesignation, getDesignationAll, getDesignationById, updateDesignation } from "./designation.controller";
import { verifyDesignation } from "./designation.validation";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";


const router = Router();

router.post(
    '/create-designation',
    verifyDesignation,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Designation, Action.create),
    createDesignation
)
router.get(
    '/get-designation-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Designation, Action.read),
    getDesignationAll
)
router.get(
    '/get-designation/:id',
    verifyJwt,
    verifyPermission(Module.Designation, Action.read),
    getDesignationById
)
router.put(
    '/update-designation/:id',
    verifyDesignation,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Designation, Action.update),
    updateDesignation
)
router.delete(
    '/delete-designation/:id',
    verifyJwt,
    verifyPermission(Module.Designation, Action.delete),
    deleteDesignation
)

export default router;