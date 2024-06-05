import { Router } from "express";
import { authOnly } from "../middlewares/authMiddleware";
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  updatePassword,
  deleteUser,
} from "../controllers/usersController";
import checkFormData from "../middlewares/checkFormDataMiddleware";
import upload from "../config/multer";
import createUploadMiddleware from "../middlewares/multerMiddleware";

const router = Router();

router.get("/profile", authOnly, getUserProfile);
router.put(
  "/profile/update",
  authOnly,
  createUploadMiddleware("profilePicture"),
  updateUserProfile
);
router.patch(
  "/password/update",
  createUploadMiddleware(undefined, 0),
  authOnly,
  checkFormData,
  updatePassword
);
router.delete("/profile", authOnly, deleteUser);
router.get("/profile/search", authOnly, searchUsers);

export default router;
