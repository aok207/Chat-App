import { Router } from "express";
import { authOnly } from "../middlewares/authMiddleware";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";
import checkFormData from "../middlewares/checkFormDataMiddleware";

const router = Router();

router.get("/profile", authOnly, getUserProfile);
router.put("/profile/update", authOnly, updateUserProfile);

export default router;
