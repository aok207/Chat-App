import { Response } from "express";
import { IRequest } from "../types/types";
import User from "../models/userModel";

function getUserProfile(req: IRequest, res: Response) {
  res.status(200).json(req.user);
}

async function updateUserProfile(req: IRequest, res: Response) {
  const { email, username, profilePicture } = req.body;

  const user = await User.findOneAndUpdate(
    { name: req.user?.name, email: req.user?.email },
    {
      name: username || req.user?.name,
      email: email || req.user?.email,
      avatar: profilePicture || req.user?.avatar,
      updated_at: Date.now(),
    }
  );

  const updatedUser = await User.findOne(
    {
      _id: user?._id,
    },
    { _id: 0, created_at: 0, password: 0, __v: 0 }
  );

  res.status(200).json({
    message: "Profile updated successfully!",
    data: updatedUser,
  });
}

async function updateUserOnlineStatus(req: IRequest, res: Response) {
  const user = await User.findOneAndUpdate(
    { name: req.user?.name, email: req.user?.email },
    {
      isOnline: req.body.onlineStatus === "active" ? true : false,
    },
    { _id: 0, created_at: 0, updated_at: 0, password: 0 }
  );

  res.status(200).json({ message: "Updated the status", data: user });
}

async function getOtherUsers(req: IRequest, res: Response) {
  const users = await User.find(
    {
      name: { $ne: req.user?.name },
      email: { $ne: req.user?.email },
    },
    { _id: 0, password: 0, created_at: 0, updated_at: 0, __v: 0 }
  );

  res.status(200).json({ data: users });
}

export {
  getUserProfile,
  updateUserProfile,
  updateUserOnlineStatus,
  getOtherUsers,
};
