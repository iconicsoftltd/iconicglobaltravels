import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyProductVariation } from "./productVariation.validation";
import {
  createProductVariation,
  getProductVariationAll,
  getProductVariationById,
  updateProductVariation,
  deleteProductVariation,
} from "./productVariation.controller";

const router = Router();

// Create ProductVariation
router.post(
  "/create-product-variation",
  verifyProductVariation,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Product_Variation, Action.create),
  createProductVariation
);

// Get All ProductVariations
router.get(
  "/get-product-variation-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Product_Variation, Action.read),
  getProductVariationAll
);

// Get ProductVariation by ID
router.get(
  "/get-product-variation/:id",
  verifyJwt,
  verifyPermission(Module.Product_Variation, Action.read),
  getProductVariationById
);

// Update ProductVariation
router.put(
  "/update-product-variation/:id",
  verifyProductVariation,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Product_Variation, Action.update),
  updateProductVariation
);

// Delete ProductVariation
router.delete(
  "/delete-product-variation/:id",
  verifyJwt,
  verifyPermission(Module.Product_Variation, Action.delete),
  deleteProductVariation
);

export default router;
