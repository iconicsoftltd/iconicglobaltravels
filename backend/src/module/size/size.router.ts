import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifySize } from "./size.validation";
import {
  createSize,
  getSizeAll,
  getSizeById,
  updateSize,
  deleteSize,
} from "./size.controller";

const router = Router();

// Create Size
router.post(
  "/create-size",
  verifySize,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Size, Action.create),
  createSize
);

// Get All Sizes
router.get(
  "/get-size-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Size, Action.read),
  getSizeAll
);

// Get Size by ID
router.get(
  "/get-size/:id",
  verifyJwt,
  verifyPermission(Module.Size, Action.read),
  getSizeById
);

// Update Size
router.put(
  "/update-size/:id",
  verifySize,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Size, Action.update),
  updateSize
);

// Delete Size
router.delete(
  "/delete-size/:id",
  verifyJwt,
  verifyPermission(Module.Size, Action.delete),
  deleteSize
);

export default router;
