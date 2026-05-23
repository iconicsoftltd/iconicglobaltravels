import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyEmployee } from "./employee.validation";
import { createEmployee, deleteEmployee, getEmployeeAll, getEmployeeById, updateEmployee, updateEmployeeStatus } from "./employee.controller";


const router = Router();

router.post(
    '/create-employee',
    verifyEmployee,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Employee, Action.create),
    createEmployee
)
router.get(
    '/get-employee-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Employee, Action.read),
    getEmployeeAll
)
router.get(
    '/get-employee/:id',
    verifyJwt,
    verifyPermission(Module.Employee, Action.read),
    getEmployeeById
)
router.put(
    '/update-employee/:id',
    verifyEmployee,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Employee, Action.update),
    updateEmployee
)
router.put(
    '/update-employee-status/:id',
    verifyJwt,
    verifyPermission(Module.Employee, Action.update),
    updateEmployeeStatus
)
router.delete(
    '/delete-employee/:id',
    verifyJwt,
    verifyPermission(Module.Employee, Action.delete),
    deleteEmployee
)

export default router;