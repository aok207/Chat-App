import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import hashPassword from "../utils/hashPassword";

function getUserProfile(req: Request, res: Response) {
  res.status(200).json(req.user);
}

async function updateUserProfile(req: Request, res: Response) {
  // get the details user submitted
  const { email, name } = req.body;
  const avatar = req.file;

  let imageUrl = null;

  // For username, check if username already exists
  const usernameExists = await User.findOne({ name });

  if (usernameExists) {
    return res.status(400).json({
      error: "Username is already taken!",
    });
  }

  // if there is a new avatar upload it to a image storage api
  if (avatar) {
    try {
      const formData = new FormData();
      formData.append("image", avatar.buffer.toString("base64"));
      const response = await fetch(
        `${process.env.IMAGE_API_URL as string}?key=${
          process.env.IMAGE_API_KEY
        }`,
        {
          method: "post",
          body: formData,
        }
      );

      if (response.ok) {
        const res = await response.json();
        imageUrl = res.data.url;
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        error: "There was an error in uploading your profile picture!",
      });
    }
  }

  const user = await User.findOneAndUpdate(
    { name: req.user?.name, email: req.user?.email },
    {
      name: name || req.user?.name,
      email: email || req.user?.email,
      avatar: imageUrl || req.user?.avatar,
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

async function updatePassword(req: Request, res: Response) {
  const { currentPassword, password, confirmPassword } = req.body;

  if (!currentPassword || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Please fill in every required fields!" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "The passwords do not match!" });
  }

  try {
    const user = await User.findOne({ email: req.user?.email });

    if (user) {
      if (user?.password) {
        if (!(await bcrypt.compare(currentPassword, user.password))) {
          return res.status(401).json({ error: "Incorrect current password!" });
        }
      }

      const hashedPassword = await hashPassword(password);
      user!.password = hashedPassword;
      await user?.save();
      return res
        .status(200)
        .json({ message: "Your password has been updated!" });
    }

    return res.status(404).json({ error: "User couldn't be found!" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Something went wrong. Please try again!" });
  }
}

async function updateUserOnlineStatus(req: Request, res: Response) {
  const user = await User.findOneAndUpdate(
    { name: req.user?.name, email: req.user?.email },
    {
      isOnline: req.body.onlineStatus === "active" ? true : false,
    },
    { _id: 0, created_at: 0, updated_at: 0, password: 0 }
  );

  res.status(200).json({ message: "Updated the status", data: user });
}

async function deleteUser(req: Request, res: Response) {
  try {
    const user = await User.findOne({
      name: req.user?.name,
      email: req.user?.email,
    });

    await user?.deleteOne();

    // log user out
    res.clearCookie("access_token").sendStatus(204);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Something went wrong!" });
  }
}

async function searchUsers(req: Request, res: Response) {
  const searchParam = req.query.name;

  const users = await User.find(
    {
      name: {
        $regex: ".*" + searchParam + ".*",
        $options: "i",
      },
      email: { $ne: req.user?.email },
    },
    { _id: 0, password: 0, created_at: 0, updated_at: 0, __v: 0 }
  );

  res.status(200).json({ data: users });
}

export {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  updateUserOnlineStatus,
  deleteUser,
  searchUsers,
};
