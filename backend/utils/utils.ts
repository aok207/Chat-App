import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ResetToken from "../models/resetTokenModel";
import { AuthenticatedSocket, IUser, JwtPayload } from "../types";
import User from "../models/userModel";
import Friend from "../models/friendModel";

export function createToken(info: { id?: mongoose.ObjectId; email?: string }) {
  const jwtSecret = process.env.JWT_ACCESS_SECRET as string;

  const token = jwt.sign(info, jwtSecret, {
    expiresIn: "30 days",
  });

  return token;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function removeExpiredTokens() {
  await ResetToken.find({ expiresAt: { $lt: new Date() } }).deleteMany();
}

export async function verifyAccessToken(
  token: string
): Promise<{ ok: boolean; message: string | null; data: IUser | null }> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || ""
    ) as JwtPayload;

    const user = (await User.findOne(
      { _id: decoded.id },
      { created_at: 0, updated_at: 0, password: 0, __v: 0 }
    )) as IUser | null;

    if (!user) {
      return { ok: false, message: "Wrong token!", data: null };
    }

    return { ok: true, message: null, data: user };
  } catch (error) {
    return { ok: false, message: "Invalid token!", data: null };
  }
}

export async function updateUserOnlineStatus(
  id: mongoose.Types.ObjectId | undefined,
  isOnline: boolean
) {
  const user = await User.findById(id);

  user!.isOnline = isOnline;
  if (!isOnline) {
    user!.lastOnline = new Date();
  }

  await user?.save();
}

export async function getFriends(
  id: mongoose.Types.ObjectId | string | undefined
) {
  const friends = await Friend.findOne({ userId: id });

  return friends;
}

export function emitEvent(
  usersMap: Map<string, AuthenticatedSocket>,
  targetId: string,
  event: string,
  userId: mongoose.Types.ObjectId | undefined
) {
  const targetSocket = usersMap.get(targetId);

  if (targetSocket) {
    targetSocket.emit(event, userId);
  }
}
