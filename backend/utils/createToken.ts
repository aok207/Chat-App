import { Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

function createToken(info: { id?: mongoose.ObjectId; email?: string }) {
  const jwtSecret = process.env.JWT_ACCESS_SECRET as string;

  const token = jwt.sign(info, jwtSecret, {
    expiresIn: "30 days",
  });

  return token;
}

export default createToken;
