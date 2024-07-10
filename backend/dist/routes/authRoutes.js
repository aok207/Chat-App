"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname.replace("\\dist", ""), "../../.env"),
});
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const checkFormDataMiddleware_1 = __importDefault(require("../middlewares/checkFormDataMiddleware"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
// authentication
router.post("/login", authMiddleware_1.guestOnly, checkFormDataMiddleware_1.default, authController_1.login);
router.post("/register", authMiddleware_1.guestOnly, checkFormDataMiddleware_1.default, authController_1.register);
router.delete("/logout", authMiddleware_1.authOnly, authController_1.logout);
// forget password
router.post("/forgot-password", authMiddleware_1.guestOnly, checkFormDataMiddleware_1.default, authController_1.forgotPassword);
router.post("/reset-password/:token", authMiddleware_1.guestOnly, checkFormDataMiddleware_1.default, authController_1.resetPassword);
// verify the reset token
router.get("/verify-reset-token/:token", authMiddleware_1.guestOnly, authController_1.verifyResetToken);
// social login routes
// google
router.get("/google/redirect", authMiddleware_1.guestOnly, passport_1.default.authenticate("google", {
    scope: ["email", "profile"],
}));
router.get("/google/callback", authMiddleware_1.guestOnly, passport_1.default.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL + "/login?error=google" || "/",
    session: false,
}), authController_1.socialCallback);
// github
router.get("/github/redirect", authMiddleware_1.guestOnly, passport_1.default.authenticate("github", {
    scope: ["user:email"],
}));
router.get("/github/callback", passport_1.default.authenticate("github", {
    failureRedirect: process.env.CLIENT_URL + "/login?error=github" || "/",
    session: false,
}), authController_1.socialCallback);
exports.default = router;
