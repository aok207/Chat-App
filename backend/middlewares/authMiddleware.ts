import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/utils";

export async function authOnly(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies["access_token"];

  if (!token) {
    return res.status(401).json({ error: "You are not logged in!" });
  }

  const verify = await verifyAccessToken(token);

  if (verify.ok) {
    req.user = verify.data;
  } else {
    return res.status(401).json({ error: verify.message });
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
