import { Router } from "express";
import { authOnly } from "../middlewares/authMiddleware";
import {
  getOtherUsers,
  getUserProfile,
  updateUserProfile,
} from "../controllers/usersController";
import checkFormData from "../middlewares/checkFormDataMiddleware";

const router = Router();

// Individuals
router.get("/profile", authOnly, getUserProfile);
router.put("/profile/update", authOnly, updateUserProfile);

// Get every other users to chat
router.get("/", authOnly, getOtherUsers);

export default router;
