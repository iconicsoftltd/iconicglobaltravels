import { Router } from "express";
import { fileUpload } from "./controller";
import fileUploadMiddleware from "../../middleware/fileUploadMiddleware";

const router = Router();

router.post('/upload', fileUploadMiddleware, fileUpload)

export default router;