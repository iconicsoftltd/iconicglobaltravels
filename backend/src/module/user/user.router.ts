import { Router } from "express";
import { verifyBranchPermissionGet } from "../../middleware/verifyBranchPermissionGet";
import { verifyJwt } from "../../middleware/verifyJwt";
import {
  Action,
  Module,
  verifyPermission,
} from "../../middleware/verifyPermission";
import {
  changePassword,
  createUser,
  deleteUser,
  forgetPassword,
  getProfile,
  getUserAll,
  getUserById,
  loginUser,
  sendForgetLink,
  sendVerifyLink,
  updateProfile,
  updateUser,
  updateUserStatus,
  verifyAccount,
} from "./user.controller";
import {
  verifyChangePassword,
  verifyForgetPassword,
  verifyProfileUpdate,
  verifyUser,
  verifyUserLogin,
  verifyUserUpdate,
} from "./user.validation";

const router = Router();

router.post(
  "/create-user",
  verifyUser,
  verifyJwt,
  verifyPermission(Module.User, Action.create),
  createUser,
);
router.post("/login-user", verifyUserLogin, loginUser);
router.post("/verify-account/:code", verifyAccount);
router.post(
  "/change-password",
  verifyChangePassword,
  verifyJwt,
  changePassword,
);
router.get("/get-profile", verifyJwt, getProfile);
router.post("/forget-password", verifyForgetPassword, forgetPassword);
router.put("/update-profile", verifyProfileUpdate, verifyJwt, updateProfile);
router.post("/send-verification-link/:email", sendVerifyLink);
router.post("/send-forget-link/:email", sendForgetLink);
router.get(
  "/get-user-all",
  verifyJwt,
  verifyBranchPermissionGet,
  verifyPermission(Module.User, Action.read),
  getUserAll,
);
router.get(
  "/get-user/:id",
  verifyJwt,
  verifyPermission(Module.User, Action.read),
  getUserById,
);
router.put(
  "/update-user/:id",
  verifyUserUpdate,
  verifyJwt,
  verifyPermission(Module.User, Action.update),
  updateUser,
);
router.put(
  "/update-user-status/:id",
  verifyJwt,
  verifyPermission(Module.User, Action.update),
  updateUserStatus,
);
router.delete(
  "/delete-user/:id",
  verifyJwt,
  verifyPermission(Module.User, Action.delete),
  deleteUser,
);

export default router;
