import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyCheque } from "./cheque.validation";
import { createCheque, deleteCheque, getChequeAll, getChequeById, updateCheque } from "./cheque.controller";


const router = Router();

router.post(
    "/create-cheque",
    verifyCheque,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Cheque, Action.create),
    createCheque
);

router.get(
    "/get-cheque-all",
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Cheque, Action.read),
    getChequeAll
);

router.get(
    "/get-cheque/:id",
    verifyJwt,
    verifyPermission(Module.Cheque, Action.read),
    getChequeById
);

router.put(
    "/update-cheque/:id",
    verifyCheque,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Cheque, Action.update),
    updateCheque
);

router.delete(
    "/delete-cheque/:id",
    verifyJwt,
    verifyPermission(Module.Cheque, Action.delete),
    deleteCheque
);

export default router;
