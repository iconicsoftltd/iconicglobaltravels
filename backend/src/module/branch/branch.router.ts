import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { createBranch, deleteBranch, getBranchAll, getBranchById, updateBranch } from "./branch.controller";
import { verifyBranch } from "./branch.validation";


const router = Router();

router.post('/create-branch', verifyJwt, verifyPermission(Module.Branch, Action.create),verifyBranch, createBranch)
router.get('/get-branch-all', verifyJwt, verifyPermission(Module.Branch, Action.read), getBranchAll)
router.get('/get-branch/:id', verifyJwt, verifyPermission(Module.Branch, Action.read), getBranchById)
router.put('/update-branch/:id', verifyJwt, verifyPermission(Module.Branch, Action.update), verifyBranch, updateBranch)
router.delete('/delete-branch/:id', verifyJwt, verifyPermission(Module.Branch, Action.delete), deleteBranch)

export default router;