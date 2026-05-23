import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyUnit } from "./unit.validation";
import {
  createUnit,
  getUnitAll,
  getUnitById,
  updateUnit,
  deleteUnit,
} from "./unit.controller";

const router = Router();

// Create Unit
router.post(
  "/create-unit",
  verifyUnit,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Unit, Action.create),
  createUnit
);

// Get All Units
router.get(
  "/get-unit-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Unit, Action.read),
  getUnitAll
);

// Get Unit by ID
router.get(
  "/get-unit/:id",
  verifyJwt,
  verifyPermission(Module.Unit, Action.read),
  getUnitById
);

// Update Unit
router.put(
  "/update-unit/:id",
  verifyUnit,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Unit, Action.update),
  updateUnit
);

// Delete Unit
router.delete(
  "/delete-unit/:id",
  verifyJwt,
  verifyPermission(Module.Unit, Action.delete),
  deleteUnit
);

export default router;
