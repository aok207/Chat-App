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
  .route("/messages/:receiverId")
  .post(authOnly, createUploadMiddleware("file"), sendMessage)
  // @route GET /api/v1/messages/
  // @desc get paginated messages for a chat
  // request query params - ?page=
  .get(authOnly, getMessages);

router.patch("/messages/:otherId/mark-as-read", authOnly, markAsRead);
router.get("/messages", authOnly, getChats);

// edit and delete message
router
  .route("/message/:id")
  .patch(authOnly, editMessage)
  .delete(authOnly, deleteMessage);

// reactions
router.patch("/messages/:messageId/add-reaction", authOnly, addReaction);
router.delete("/messages/:messageId/remove-reaction", authOnly, removeReaction);
router.get("/messages/:messageId/reactions", authOnly, getReactions);

export default router;
