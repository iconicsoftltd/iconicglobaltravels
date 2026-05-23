import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyProduct } from "./product.validation";
import {
  createProduct,
  getProductAll,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./product.controller";

const router = Router();

// Create Product
router.post(
  "/create-product",
  verifyProduct,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Product, Action.create),
  createProduct
);

// Get All Products
router.get(
  "/get-product-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Product, Action.read),
  getProductAll
);

// Get Product by ID
router.get(
  "/get-product/:id",
  verifyJwt,
  verifyPermission(Module.Product, Action.read),
  getProductById
);

// Update Product
router.put(
  "/update-product/:id",
  verifyProduct,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Product, Action.update),
  updateProduct
);

// Delete Product
router.delete(
  "/delete-product/:id",
  verifyJwt,
  verifyPermission(Module.Product, Action.delete),
  deleteProduct
);

export default router;
