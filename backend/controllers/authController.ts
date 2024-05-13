import { Request, Response } from "express";
import User from "../models/userModel";
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

    if (!user) {
      return res
        .status(404)
        .json({ error: "A user doesn't exist with the given email." });
    }

    if (user.password) {
      if (!user || (user && !(await bcrypt.compare(password, user.password)))) {
        return res.status(401).json({ error: "Incorrect email or password!" });
      }
    } else {
      // If there is no password the user is signed in with either google or github
      return res
        .status(401)
        .json({ error: "This email is registered with a different provider." });
    }

    // Log user in
    const token = createToken({
      id: user.id,
    });

    res
      .cookie("access_token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ message: "Logged In successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error while logging in, please try again." });
  }
}

// success callback function for socail logins
async function socialCallback(req: Request, res: Response) {
  const email = req.user?.email;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = createToken({ id: user._id });

      res
        .cookie("access_token", token, {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .redirect(process.env.CLIENT_URL + "/login?success=oAuth" || "/");
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    res.redirect(process.env.CLIENT_URL + "/login?error=oAuth" || "/");
  }
}

async function register(req: Request, res: Response) {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Both email and password fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  // find if user exists
  try {
    const existingUser = await User.findOne({ $or: [{ name, email }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ error: "User with the same email already exists!" });
      }

      if (existingUser.name === name) {
        return res.status(400).json({
          error: "Username already in use. Please choose a different username.",
        });
      }
    } else {
      // make a new user
      const user = await User.create({
        name,
        email,
        password: await hashPassword(password),
      });

      if (user) {
        const token = createToken({
          id: user.id,
        });

        res
          .cookie("access_token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          })
          .status(201)
          .json({ message: "Account created successfully!" });
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

export { login, socialCallback, register, logout };
