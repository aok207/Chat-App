"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messagesController_1 = require("../controllers/messagesController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multerMiddleware_1 = __importDefault(require("../middlewares/multerMiddleware"));
const router = (0, express_1.Router)();
router
    .route("/:receiverId")
    .post(authMiddleware_1.authOnly, (0, multerMiddleware_1.default)("file"), messagesController_1.sendMessage)
    // @route GET /api/v1/messages/
    // @desc get paginated messages for a chat
    // request query params - ?page=
    .get(authMiddleware_1.authOnly, messagesController_1.getMessages);
router.patch("/:otherId/mark-as-read", authMiddleware_1.authOnly, messagesController_1.markAsRead);
router.get("/", authMiddleware_1.authOnly, messagesController_1.getChats);
// edit and delete message
router
    .route("/:id")
    .patch(authMiddleware_1.authOnly, messagesController_1.editMessage)
    .delete(authMiddleware_1.authOnly, messagesController_1.deleteMessage);
// reactions
router.patch("/:messageId/add-reaction", authMiddleware_1.authOnly, messagesController_1.addReaction);
router.delete("/:messageId/remove-reaction", authMiddleware_1.authOnly, messagesController_1.removeReaction);
router.get("/:messageId/reactions", authMiddleware_1.authOnly, messagesController_1.getReactions);
exports.default = router;
