
import { Router } from "express";
import { get } from "http";
import { getTestUser } from "./test.controller";

const router = Router();

router.get(
  "/testuser",
  (req, res) => {
    res.send("testuser");
  }
);
router.get(
  "/testgetuser",
  getTestUser
);

export default router;