import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyBrand } from "./brand.validation";
import {
  createBrand,
  getBrandAll,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "./brand.controller";

const router = Router();

router.post(
  "/create-brand",
  verifyBrand,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Brand, Action.create),
  createBrand
);

router.get(
  "/get-brand-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Brand, Action.read),
  getBrandAll
);

router.get(
  "/get-brand/:id",
  verifyJwt,
  verifyPermission(Module.Brand, Action.read),
  getBrandById
);

router.put(
  "/update-brand/:id",
  verifyBrand,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Brand, Action.update),
  updateBrand
);

router.delete(
  "/delete-brand/:id",
  verifyJwt,
  verifyPermission(Module.Brand, Action.delete),
  deleteBrand
);

export default router;
