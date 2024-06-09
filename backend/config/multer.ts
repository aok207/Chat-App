import multer from "multer";

// multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024 },
});

export default upload;
