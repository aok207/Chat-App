import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname.replace("\\dist", ""), "../../.env"),
});

import express from "express";
import { createServer as httpsCreateServer } from "node:https";
import { Server } from "socket.io";
import cors from "cors";
import cookie from "cookie";
import connectToDB from "../config/db";
import {
  emitEvent,
  updateUserOnlineStatus,
  verifyAccessToken,
} from "../utils/utils";
import { AuthenticatedSocket } from "../types";

const app = express();

connectToDB();

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
// app.use(cookieParser());

const server = httpsCreateServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
  cookie: true,
});

io.use(async (socket: AuthenticatedSocket, next: Function) => {
  if (!socket.handshake.headers.cookie) {
    return next(new Error("No token"));
  }

  const parsedCookie = cookie.parse(socket.handshake.headers.cookie);

  if (!parsedCookie["access_token"]) {
    return next(new Error("No token"));
  }

  const verify = await verifyAccessToken(parsedCookie["access_token"]);

  if (!verify.ok) {
    return next(new Error(verify.message as string));
  }

  socket.user = verify.data;
  next();
});

// online users
const onlineUsers = new Map<string, AuthenticatedSocket>();

io.on("connection", async (socket: AuthenticatedSocket) => {
  const userId = socket.user?._id;

  // update the user's online status to online
  updateUserOnlineStatus(userId, true);
  onlineUsers.set(userId?.toString() as string, socket);

  io.emit("user online", userId);

  socket.on("disconnect", () => {
    updateUserOnlineStatus(socket.user?._id, false);
    io.emit("user offline", userId);
    onlineUsers.delete(userId?.toString() as string);
  });

  // event when the user is typing
  socket.on("typing to", (targetId: string) => {
    emitEvent(onlineUsers, targetId, "other user is typing", userId);
  });

  socket.on("stopped typing to", (targetId: string) => {
    emitEvent(onlineUsers, targetId, "other user stopped typing", userId);
  });

  // changes in message event (send, edit, delete)
  socket.on("changed messages", (targetId: string) => {
    emitEvent(onlineUsers, targetId, "messages changed", userId);
  });

  // mark as read event
  socket.on("message read", (targetId: string) => {
    emitEvent(onlineUsers, targetId, "other has read message", userId);
  });

  // user gave an reaction event
  socket.on(
    "give reaction",
    (
      originalEmoji: string,
      emoji: string,
      targetId: string,
      messageId: string
    ) => {
      emitEvent(
        onlineUsers,
        targetId,
        "reaction added",
        userId,
        originalEmoji,
        emoji,
        messageId
      );
    }
  );

  // user removed an reaction event
  socket.on(
    "remove reaction",
    (emoji: string, targetId: string, messageId: string) => {
      emitEvent(
        onlineUsers,
        targetId,
        "reaction removed",
        userId,
        emoji,
        messageId
      );
    }
  );
});

// server.listen(3001, () => {
//   console.log("Sockets server listening on port:3001");
// });

export { app, server };
