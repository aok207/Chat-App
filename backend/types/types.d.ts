import { Request } from "express";
import mongoose from "mongoose";

export type userType = {
  email: string;
  name: string;
  isOnline: boolean | undefined;
  avatar: string | null | undefined;
};

export interface IRequest extends Request {
  user?: userType | null;
}

export type JwtPayload = {
  id: mongoose.Types.ObjectId;
};
