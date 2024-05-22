import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookie from "cookie";
import { type Request, type Response } from "express";
import connectToDB from "../config/db";
import { updateUserOnlineStatus, verifyAccessToken } from "../utils/utils";
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

const server = createServer(app);
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
  console.log(socket.user);
  next();
});

io.on("connection", (socket: AuthenticatedSocket) => {
  // update the user's online status to online
  updateUserOnlineStatus(socket.user?._id, true);
  console.log(`user:${socket.user}`);

  socket.on("disconnect", () => {
    updateUserOnlineStatus(socket.user?._id, false);
    console.log(`user:${socket.user?.name} disconnected`);
  });
});

server.listen(3001, () => {
  console.log("Sockets server listening on port:3001");
});
