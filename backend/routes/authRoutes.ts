import { Router } from "express";
import { login, logout, register } from "../controllers/authController";
import checkFormData from "../middlewares/checkFormDataMiddleware";
import { authOnly, guestOnly } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", guestOnly, checkFormData, login);
router.post("/register", guestOnly, checkFormData, register);
router.delete("/logout", authOnly, logout);

export default router;
