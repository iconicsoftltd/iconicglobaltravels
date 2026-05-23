import { NextFunction, Request, Response } from "express";
import uploader from "../utils/uploader";

const fileUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const multerUploader = uploader({
    allowedFileTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    errorMessage: "Only .jpg, .jpeg and .png format allowed!",
    maxFileSize: 1024 * 1024 * 5, // 5MB
  });

  multerUploader.any()(req, res, (err: any) => {
    if (err) {
        console.log(err)
      return res.status(400).json({
        name: "FileUploadError",
        message: "File upload error",
        statusCode: 400,
        error: "Bad Request",
        details: [
          {
            file: err.message,
          },
        ],
      });
    }

    next();
  });
};

export default fileUploadMiddleware;
