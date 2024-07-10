import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getChats,
  markAsRead,
  removeReaction,
  addReaction,
  getReactions,
  editMessage,
  deleteMessage,
} from "../controllers/messagesController";
import { authOnly } from "../middlewares/authMiddleware";
import createUploadMiddleware from "../middlewares/multerMiddleware";

const router = Router();

router
  .route("/:receiverId")
  .post(authOnly, createUploadMiddleware("file"), sendMessage)
  // @route GET /api/v1/messages/
  // @desc get paginated messages for a chat
  // request query params - ?page=
  .get(authOnly, getMessages);

router.patch("/:otherId/mark-as-read", authOnly, markAsRead);
router.get("/", authOnly, getChats);

// edit and delete message
router
  .route("/:id")
  .patch(authOnly, editMessage)
  .delete(authOnly, deleteMessage);

// reactions
router.patch("/:messageId/add-reaction", authOnly, addReaction);
router.delete("/:messageId/remove-reaction", authOnly, removeReaction);
router.get("/:messageId/reactions", authOnly, getReactions);

export default router;
