import { Router } from "express";
import { verifyJwt } from "../../middleware/verifyJwt";
import { Action, Module, verifyPermission } from "../../middleware/verifyPermission";
import { verifyBranchPermissionCreate } from "../../middleware/verifyBranchPermissionCreate";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyLedger } from "./ledger.validation";
import { createLedger, deleteLedger, getLedgerAll, getLedgerById, updateLedger } from "./ledger.controller";


const router = Router();

router.post(
    '/create-ledger',
    verifyLedger,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Ledger, Action.create),
    createLedger
)
router.get(
    '/get-ledger-all',
    verifyJwt,
    verifyBranchPermissionGet,
    verifyPermission(Module.Ledger, Action.read),
    getLedgerAll
)
router.get(
    '/get-ledger/:id',
    verifyJwt,
    verifyPermission(Module.Ledger, Action.read),
    getLedgerById
)
router.put(
    '/update-ledger/:id',
    verifyLedger,
    verifyJwt,
    verifyBranchPermissionCreate,
    verifyPermission(Module.Ledger, Action.update),
    updateLedger
)
router.delete(
    '/delete-ledger/:id',
    verifyJwt,
    verifyPermission(Module.Ledger, Action.delete),
    deleteLedger
)

export default router;