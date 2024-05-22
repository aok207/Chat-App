import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookie from "cookie";
import { AuthenticatedSocket, IUser, JwtPayload } from "../types";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import connectToDB from "../config/db";

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

io.engine.use(async (req: any, res: Response, next: Function) => {
  const isHandshake = req._query.sid === undefined;

  if (isHandshake) {
    if (!req.headers.cookie) {
      return next(new Error("No token"));
    }

    const parsedCookie = cookie.parse(req.headers.cookie);

    if (!parsedCookie["access_token"]) {
      return next(new Error("No token"));
    }

    try {
      const decoded = jwt.verify(
        parsedCookie["access_token"],
        process.env.JWT_ACCESS_SECRET || ""
      ) as JwtPayload;

      const user = (await User.findOne(
        { _id: decoded.id },
        { created_at: 0, updated_at: 0, password: 0, __v: 0 }
      ).exec()) as IUser | null;

      if (!user) {
        return next(new Error("Wrong token!"));
      }

      req.user = user;

      console.log(req.user);
      next();
    } catch (error) {
      return next(new Error("Invalid token!"));
    }
  } else {
    next();
  }
});

io.on("connection", (socket) => {
  const req = socket.request as Request;

  console.log(`user:${req.user}`);
});

server.listen(3001, () => {
  console.log("Sockets server listening on port:3001");
});
