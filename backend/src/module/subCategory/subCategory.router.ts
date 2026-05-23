import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifySubCategory } from "./subCategory.validation";
import {
  createSubCategory,
  getSubCategoryAll,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} from "./subCategory.controller";

const router = Router();

router.post(
  "/create-subcategory",
  verifySubCategory,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.SubCategory, Action.create),
  createSubCategory
);

router.get(
  "/get-subcategory-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.SubCategory, Action.read),
  getSubCategoryAll
);

router.get(
  "/get-subcategory/:id",
  verifyJwt,
  verifyPermission(Module.SubCategory, Action.read),
  getSubCategoryById
);

router.put(
  "/update-subcategory/:id",
  verifySubCategory,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.SubCategory, Action.update),
  updateSubCategory
);

router.delete(
  "/delete-subcategory/:id",
  verifyJwt,
  verifyPermission(Module.SubCategory, Action.delete),
  deleteSubCategory
);

export default router;
