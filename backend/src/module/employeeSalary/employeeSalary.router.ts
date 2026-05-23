import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";

import {
    createSalary,
    updateSalary,
    deleteSalary,
    getSalaryAll,
    getSalaryById,
} from "./employeeSalary.controller";

import { verifySalary } from "./employeeSalary.validation";

const router = Router();

// ✅ Create salary
router.post(
    "/create-salary",
    verifySalary,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Salary, Action.create),
    createSalary
);

// ✅ Get all salaries
router.get(
    "/get-salary-all",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Salary, Action.read),
    getSalaryAll
);

// ✅ Get single salary
router.get(
    "/get-salary/:id",
    verifyJwt,
    verifyPermission(Module.Salary, Action.read),
    getSalaryById
);

// ✅ Update salary
router.put(
    "/update-salary/:id",
    verifySalary,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Salary, Action.update),
    updateSalary
);

// ✅ Delete salary
router.delete(
    "/delete-salary/:id",
    verifyJwt,
    verifyPermission(Module.Salary, Action.delete),
    deleteSalary
);

export default router;
