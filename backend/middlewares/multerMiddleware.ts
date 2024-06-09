import { MulterError } from "multer";
import multerUpload from "../config/multer";
import { Request, Response, NextFunction } from "express";

const createUploadMiddleware = (
  fileName?: string,
  fileCount = 1,
  maxCount = 10
) => {
  const upload =
    fileCount === 0
      ? multerUpload.none()
      : fileCount === 1
      ? multerUpload.single(fileName as string)
      : multerUpload.array(fileName as string, maxCount);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
      if (err) {
        if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(413)
            .json({ error: "File size exceeds the 80 MB limit" });
        }
        // Handle other Multer errors
        return res.status(400).json({ error: err.message });
      }
      // Proceed to the next middleware or route handler if no error
      next();
    });
  };
};

export default createUploadMiddleware;
