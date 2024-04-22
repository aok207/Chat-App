import { Request, Response, NextFunction } from "express";
import { IRequest, JwtPayload, userType } from "../types/types";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

export async function authOnly(
  req: IRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies["access_token"];

  if (!token) {
    return res.status(401).json({ error: "You are not logged in!" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || ""
    ) as JwtPayload;

    const user = (await User.findOne(
      { _id: decoded.id },
      { _id: 0, created_at: 0, updated_at: 0, password: 0, __v: 0 }
    )) as userType | null;

    if (!user) {
      return res.status(401).json({ error: "Wrong token." });
    }

    req.user = user;
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }

  next();
}

export function guestOnly(req: IRequest, res: Response, next: NextFunction) {
  const token = req.cookies["access_token"];

  if (token) {
    return res.status(403).json({ error: "You are already logged in!" });
  }
  next();
}
