import { Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

function createToken(
  user: {
    id: mongoose.Types.ObjectId;
  },
  res: Response,
  status: number
) {
  const token = jwt.sign(user, process.env.JWT_ACCESS_SECRET || "", {
    expiresIn: "30 days",
  });

  res
    .cookie("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .status(status)
    .json({ message: `Logged in successfully.` });
}

export default createToken;
