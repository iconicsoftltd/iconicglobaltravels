import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import config from "../config";
import { IUploadFile } from "../types/interface";

cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.cloud_api_key,
  api_secret: config.cloud_secret_key,
});

const DEFAULT_ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
const DEFAULT_MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

const uploader = ({
  allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
  errorMessage = "Invalid file type",
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  uploadPath = "uploads",
}: IUploadFile) => {
  const UPLOADS_FOLDER = path.join(__dirname, `../../public/${uploadPath}`);

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "uploads", // Change this to your desired folder name
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    } as any, // Use an assertion here
  });

  const fileFilter = (req: any, file: any, cb: any) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(errorMessage));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
    },
  });
  return upload;
};

export default uploader;
