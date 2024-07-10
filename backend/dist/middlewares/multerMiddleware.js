"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = require("multer");
const multer_2 = __importDefault(require("../config/multer"));
const createUploadMiddleware = (fileName, fileCount = 1, maxCount = 10) => {
    const upload = fileCount === 0
        ? multer_2.default.none()
        : fileCount === 1
            ? multer_2.default.single(fileName)
            : multer_2.default.array(fileName, maxCount);
    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                if (err instanceof multer_1.MulterError && err.code === "LIMIT_FILE_SIZE") {
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
exports.default = createUploadMiddleware;
