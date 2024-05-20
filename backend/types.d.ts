import mongoose from "mongoose";
import { Express } from "express-serve-static-core";

export interface IUser {
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
