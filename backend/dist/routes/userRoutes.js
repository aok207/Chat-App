"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const usersController_1 = require("../controllers/usersController");
const checkFormDataMiddleware_1 = __importDefault(require("../middlewares/checkFormDataMiddleware"));
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const router = (0, express_1.Router)();
router.get("/profile", authMiddleware_1.authOnly, usersController_1.getUserProfile);
router.put("/profile/update", authMiddleware_1.authOnly, (0, multerMiddleware_1.default)("profilePicture"), usersController_1.updateUserProfile);
router.patch("/password/update", (0, multerMiddleware_1.default)(undefined, 0), authMiddleware_1.authOnly, checkFormDataMiddleware_1.default, usersController_1.updatePassword);
router.delete("/profile", authMiddleware_1.authOnly, usersController_1.deleteUser);
router.get("/profile/search", authMiddleware_1.authOnly, usersController_1.searchUsers);
exports.default = router;
