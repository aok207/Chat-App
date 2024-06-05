import mongoose from "mongoose";
import { Express } from "express-serve-static-core";
import { Socket } from "socket.io";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  isOnline: boolean | undefined;
  avatar: string | null | undefined;
  lastOnline: Date | null;
}

export type ChatResponseType = {
  latestMessage: string | null;
  latestTime: Date | null;
  latestMessageStatus: string | null;
  latestMessageSenderId: mongoose.Types.ObjectId;
  otherUser: IUser;
  latestMessageType: string | null;
};

declare module "express-serve-static-core" {
  interface Request {
    user: IUser | null;
  }
}

export type JwtPayload = {
  id?: mongoose.Types.ObjectId;
  email?: string;
};

interface AuthenticatedSocket extends Socket {
  user?: IUser | null;
}

export type FileType = {
  public_id: string;
  url: string;
  name: string;
  size: number;
};
