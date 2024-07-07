import { Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import { hashPassword, uploadFile } from "../utils/utils";

function getUserProfile(req: Request, res: Response) {
  res.status(200).json(req.user);
}

const allowedExtensions = ["image/jpeg", "image/jpg", "image/png"];

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
    // validate the uploaded file
    if (!allowedExtensions.includes(avatar.mimetype)) {
      return res
        .status(415)
        .json({ error: "The avatar file type is not allowed!" });
    }

    if (avatar.size > 10000000) {
      return res
        .status(413)
        .json({ error: "The file size cannot be larger than 10 MB!" });
    }

    const b64 = Buffer.from(avatar.buffer).toString("base64");
    const dataURI = "data:" + avatar.mimetype + ";base64," + b64;
    const uploadResult = await uploadFile(dataURI);

    if (uploadResult.secure_url) {
      imageUrl = uploadResult.secure_url;
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
    { created_at: 0, updated_at: 0, password: 0, __v: 0 }
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
    { password: 0, created_at: 0, updated_at: 0, __v: 0 }
  );

  res.status(200).json({ data: users });
}

export {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteUser,
  searchUsers,
};
