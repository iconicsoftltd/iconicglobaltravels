import { Router } from "express";
import { getPermissionAll } from "./permission.controller";

const router = Router();

router.get("/get-permission-all", getPermissionAll);

export default router;