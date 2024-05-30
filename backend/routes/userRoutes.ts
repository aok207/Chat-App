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
import multer from "multer";

// multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/profile", authOnly, getUserProfile);
router.put(
  "/profile/update",
  authOnly,
  upload.single("profilePicture"),
  updateUserProfile
);
router.patch(
  "/password/update",
  upload.none(),
  authOnly,
  checkFormData,
  updatePassword
);
router.delete("/profile", authOnly, deleteUser);
router.get("/profile/search", authOnly, searchUsers);

export default router;
