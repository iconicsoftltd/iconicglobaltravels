import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifySalaryStructure } from "./salaryStructure.validation";
import { getSalaryStructureByBranch, upsertSalaryStructure } from "./salaryStructure.controller";



const router = Router();


// Get All Salary_Structure
router.get(
    "/get-salary-structure-by-branch",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Salary_Structure, Action.read),
    getSalaryStructureByBranch
);


// Update Salary_Structure
router.put(
    "/update-salary-structure/:id",
    verifySalaryStructure,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Salary_Structure, Action.update),
    upsertSalaryStructure
);


export default router;
