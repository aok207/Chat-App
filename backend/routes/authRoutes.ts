import { Router } from "express";
import {
  login,
  logout,
  register,
  socialCallback,
} from "../controllers/authController";
import checkFormData from "../middlewares/checkFormDataMiddleware";
import { authOnly, guestOnly } from "../middlewares/authMiddleware";
import passport from "passport";

const router = Router();

router.post("/login", guestOnly, checkFormData, login);
router.post("/register", guestOnly, checkFormData, register);
router.delete("/logout", authOnly, logout);

// social login routes
// google
router.get(
  "/google/redirect",
  guestOnly,
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

router.get(
  "/google/callback",
  guestOnly,
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL + "/login?error=google" || "/",
    session: false,
  }),
  socialCallback
);

export default router;
