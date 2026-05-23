import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyCategory } from "./category.validation";
import {
  createCategory,
  getCategoryAll,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller";

const router = Router();

router.post(
  "/create-category",
  verifyCategory,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Category, Action.create),
  createCategory
);

router.get(
  "/get-category-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Category, Action.read),
  getCategoryAll
);

router.get(
  "/get-category/:id",
  verifyJwt,
  verifyPermission(Module.Category, Action.read),
  getCategoryById
);

router.put(
  "/update-category/:id",
  verifyCategory,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Category, Action.update),
  updateCategory
);

router.delete(
  "/delete-category/:id",
  verifyJwt,
  verifyPermission(Module.Category, Action.delete),
  deleteCategory
);

export default router;
