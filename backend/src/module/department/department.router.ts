import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyDepartment } from "./department.validation";
import { createDepartment, deleteDepartment, getDepartmentAll, getDepartmentById, updateDepartment } from "./department.controller";


const router = Router();

router.post(
    '/create-department',
    verifyDepartment,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Department, Action.create),
    createDepartment
)
router.get(
    '/get-department-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Department, Action.read),
    getDepartmentAll
)
router.get(
    '/get-department/:id',
    verifyJwt,
    verifyPermission(Module.Department, Action.read),
    getDepartmentById
)
router.put(
    '/update-department/:id',
    verifyDepartment,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Department, Action.update),
    updateDepartment
)
router.delete(
    '/delete-department/:id',
    verifyJwt,
    verifyPermission(Module.Department, Action.delete),
    deleteDepartment
)

export default router;