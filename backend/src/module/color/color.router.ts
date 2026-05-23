import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyColor } from "./color.validation";
import {
  createColor,
  getColorAll,
  getColorById,
  updateColor,
  deleteColor,
} from "./color.controller";

const router = Router();

router.post(
  "/create-color",
  verifyColor,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Color, Action.create),
  createColor
);

router.get(
  "/get-color-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Color, Action.read),
  getColorAll
);

router.get(
  "/get-color/:id",
  verifyJwt,
  verifyPermission(Module.Color, Action.read),
  getColorById
);

router.put(
  "/update-color/:id",
  verifyColor,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Color, Action.update),
  updateColor
);

router.delete(
  "/delete-color/:id",
  verifyJwt,
  verifyPermission(Module.Color, Action.delete),
  deleteColor
);

export default router;
