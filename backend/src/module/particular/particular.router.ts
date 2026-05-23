import { Router } from "express";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyJwt } from "../../middleware/verifyJwt";
import {
  Action,
  Module,
  verifyPermission,
} from "../../middleware/verifyPermission";
import { getEmployeeAll } from "../employee/employee.controller";
import {
  createParticular,
  deleteParticular,
  getAllAccounts,
  getAllCustomer,
  getAllExpenseParticular,
  getAllParticulars,
  getAllSupplier,
  getParticularById,
  getParticularsForSelectService,
  updateParticular,
} from "./particular.controller";
import { verifyParticular } from "./particular.validation";

const router = Router();

router.post(
  "/create-particular",
  verifyParticular,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Particular, Action.create),
  createParticular,
);
router.get(
  "/get-particular-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Particular, Action.read),
  getAllParticulars,
);
router.get(
  "/particular-options",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Particular, Action.read),
  getParticularsForSelectService,
);

// * Accounts Receivable
router.get(
  "/get-customer-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Particular, Action.read),
  getAllCustomer,
);

// * Accounts Payable
router.get(
  "/get-supplier-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Particular, Action.read),
  getAllSupplier,
);

router.get(
  "/get-employee-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Particular, Action.read),
  getEmployeeAll,
);
router.get(
  "/get-expense-particular-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Particular, Action.read),
  getAllExpenseParticular,
);

router.get(
  "/get-accounts-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Particular, Action.read),
  getAllAccounts,
);
router.get(
  "/get-particular/:id",
  verifyJwt,
  verifyPermission(Module.Particular, Action.read),
  getParticularById,
);
router.put(
  "/update-particular/:id",
  verifyParticular,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Particular, Action.update),
  updateParticular,
);
router.delete(
  "/delete-particular/:id",
  verifyJwt,
  verifyPermission(Module.Particular, Action.delete),
  deleteParticular,
);

export default router;
