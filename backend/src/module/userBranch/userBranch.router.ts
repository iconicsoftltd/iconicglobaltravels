import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import {
  Action,
  Module,
  verifyPermission,
} from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyUserBranch } from "./userBranch.validation";
import {
  createUserBranch,
  deleteUserBranch,
  getUserBranchAll,
  getUserBranchById,
  updateUserBranch,
} from "./userBranch.controller";

const router = Router();

router.post(
  "/create-branch-assign",
  verifyUserBranch,
  verifyJwt,
  // verifyBranchPermissionCreate,
  verifyPermission(Module.Branch_Assign, Action.create),
  createUserBranch,
);
router.get(
  "/get-branch-assign-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Branch_Assign, Action.read),
  getUserBranchAll,
);
router.get(
  "/get-branch-assign/:id",
  verifyJwt,
  verifyPermission(Module.Branch_Assign, Action.read),
  getUserBranchById,
);
router.put(
  "/update-branch-assign/:id",
  verifyUserBranch,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Branch_Assign, Action.update),
  updateUserBranch,
);
router.delete(
  "/delete-branch-assign/:id",
  verifyJwt,
  verifyPermission(Module.Branch_Assign, Action.delete),
  deleteUserBranch,
);

export default router;
