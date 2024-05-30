import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getChats,
  markAsRead,
} from "../controllers/messagesController";
import { authOnly } from "../middlewares/authMiddleware";

const router = Router();

router
  .route("/messages/:receiverId")
  .post(authOnly, sendMessage)
  // @route GET /api/v1/messages/
  // @desc get paginated messages for a chat
  // request query params - ?page=
  .get(authOnly, getMessages);

router.patch("/messages/:otherId/mark-as-read", authOnly, markAsRead);
router.get("/messages", authOnly, getChats);

export default router;
