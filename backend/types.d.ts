import mongoose from "mongoose";
import { Express } from "express-serve-static-core";
import { Socket } from "socket.io";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  isOnline: boolean | undefined;
  avatar: string | null | undefined;
  provider: "google" | "github" | null | undefined;
}

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
  user?: IUser;
}
