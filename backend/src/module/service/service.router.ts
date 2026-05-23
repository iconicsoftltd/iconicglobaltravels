import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyService } from "./service.validation";
import { createService, deleteService, getServiceAll, getServiceById, updateService } from "./service.controller";


const router = Router();

// Create service
router.post(
  "/create-service",
  verifyService,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Service, Action.create),
  createService
);

// Get All services
router.get(
  "/get-service-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Service, Action.read),
  getServiceAll
);

// Get service by ID
router.get(
  "/get-service/:id",
  verifyJwt,
  verifyPermission(Module.Service, Action.read),
  getServiceById
);

// Update service
router.put(
  "/update-service/:id",
  verifyService,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Service, Action.update),
  updateService
);

// Delete service
router.delete(
  "/delete-service/:id",
  verifyJwt,
  verifyPermission(Module.Service, Action.delete),
  deleteService
);

export default router;
