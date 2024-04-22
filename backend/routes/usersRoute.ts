import { Router } from "express";
import { authOnly } from "../middlewares/authMiddleware";
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
} from "../controllers/usersController";
import checkFormData from "../middlewares/checkFormDataMiddleware";

const router = Router();

router.get("/profile", authOnly, getUserProfile);
router.put("/profile/update", authOnly, updateUserProfile);
router.get("/profile/search", authOnly, searchUsers);

export default router;
