import { Request, Response } from "express";
import User from "../database/userModel";
import hashPassword from "../utils/hashPassword";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken";

const users = [
  {
    email: "AOK",
    password: "password",
  },
];

async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Both email and password fields are required." });
  }

  // find user
  try {
    const user = await User.findOne({ email: email });

    if (!user || (user && !(await bcrypt.compare(password, user.password)))) {
      return res.status(401).json({ error: "Incorrect email or password!" });
    }

    // Log user in
    createToken(
      {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnline: user.isOnline,
      },
      res,
      200
    );
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error while logging in, please try again." });
  }
}

async function register(req: Request, res: Response) {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Both email and password fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  // find if user exists
  try {
    const existingUser = await User.findOne({ $or: [{ username, email }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ error: "User with the same email already exists!" });
      }

      if (existingUser.name === username) {
        return res.status(400).json({
          error: "Username already in use. Please choose a different username.",
        });
      }
    } else {
      // make a new user
      const user = await User.create({
        name: username,
        email: email,
        password: await hashPassword(password),
      });

      if (user) {
        createToken(
          {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isOnline: user.isOnline,
          },
          res,
          201
        );
      } else {
        throw new Error();
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Something went wrong while registering. Please try again. 😥",
    });
  }
}

function logout(req: Request, res: Response) {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Logged out successfully!" });
}

export { login, register, logout };
