import { Request, Response, NextFunction } from "express";

export function authOnly(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies["access_token"];

  if (!token) {
    return res.status(403).json({ error: "You are not logged in!" });
  }
  next();
}

export function guestOnly(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies["access_token"];

  if (token) {
    return res.status(403).json({ error: "You are already logged in!" });
  }
  next();
}
