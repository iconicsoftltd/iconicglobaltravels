import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyBank } from "./bank.validation";
import { createBank, deleteBank, getBankAll, getBankById, updateBank } from "./bank.controller";


const router = Router();

router.post(
  "/create-bank",
  verifyBank,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Bank, Action.create),
  createBank
);

router.get(
  "/get-bank-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.Bank, Action.read),
  getBankAll
);

router.get(
  "/get-bank/:id",
  verifyJwt,
  verifyPermission(Module.Bank, Action.read),
  getBankById
);

router.put(
  "/update-bank/:id",
  verifyBank,
  verifyJwt,
  verifyBranchPermissionCreate,
  verifyPermission(Module.Bank, Action.update),
  updateBank
);

router.delete(
  "/delete-bank/:id",
  verifyJwt,
  verifyPermission(Module.Bank, Action.delete),
  deleteBank
);

export default router;
