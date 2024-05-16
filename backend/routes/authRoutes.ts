import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  socialCallback,
  verifyResetToken,
} from "../controllers/authController";
import checkFormData from "../middlewares/checkFormDataMiddleware";
import { authOnly, guestOnly } from "../middlewares/authMiddleware";
import passport from "passport";

const router = Router();

// authentication
router.post("/login", guestOnly, checkFormData, login);
router.post("/register", guestOnly, checkFormData, register);
router.delete("/logout", authOnly, logout);

// forget password
router.post("/forgot-password", guestOnly, checkFormData, forgotPassword);
router.post("/reset-password/:token", guestOnly, checkFormData, resetPassword);
// verify the reset token
router.get("/verify-reset-token/:token", guestOnly, verifyResetToken);

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

// github
router.get(
  "/github/redirect",
  guestOnly,
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: process.env.CLIENT_URL + "/login?error=github" || "/",
    session: false,
  }),
  socialCallback
);

export default router;
