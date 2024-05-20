import { Request, Response } from "express";
import User from "../models/userModel";
import hashPassword from "../utils/hashPassword";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken";
import jwt from "jsonwebtoken";
import mailTransporter, { getMailHtml } from "../config/nodemailer";
import ResetToken from "../models/resetTokenModel";
import { JwtPayload } from "../types";

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
      .json({ error: "Please fill in every required field!" });
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

async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email field is required!" });
  }

  const checkUserExists = await User.findOne({ email });

  if (!checkUserExists) {
    return res
      .status(404)
      .json({ error: "There is no user associated with that email!" });
  }

  if (checkUserExists.provider !== null) {
    return res
      .status(404)
      .json({ error: "Your email is registered with an another provider." });
  }

  // If passed all the checks, send the email
  // But first create a token
  const token = createToken({ email });

  try {
    // Store it in the database
    // Expire time is one hour
    await ResetToken.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const info = await mailTransporter.sendMail({
      from: '"Pulse Chat" <aungookhant.business@gmail.com>',
      to: email,
      subject: "Your password reset link!",
      html: getMailHtml(
        checkUserExists.name as string,
        `${process.env.CLIENT_URL}/reset-password/${token}`
      ),
    });

    console.log("Message sent: %s", info.messageId);

    res.status(200).json({
      message:
        "An email with the link to reset your password, has been sent. Please check your inbox.",
    });
  } catch (err: any) {
    console.log(err);

    if (err.code === 11000 && err.name === "MongoServerError") {
      return res
        .status(400)
        .json({ error: "The password reset email has already been sent!" });
    }
    res.status(500).json({ error: "Something went wrong! Please try again!" });
  }
}

async function verifyResetToken(req: Request, res: Response) {
  const token = req.params.token;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    if (decoded) {
      const tokenExists = await ResetToken.findOne({ email: decoded.email });

      // Checks for token
      if (!tokenExists) {
        return res.sendStatus(404);
      }

      if (tokenExists.token !== token) {
        return res.sendStatus(401);
      }

      if (tokenExists.expiresAt < new Date()) {
        return res.sendStatus(404);
      }

      return res.sendStatus(200);
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    res.sendStatus(400);
  }
}

async function resetPassword(req: Request, res: Response) {
  const token = req.params.token;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Please fill in every required fields!" });
  }

  try {
    // get the email from the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    if (!decoded.email) {
      return res.status(401).json({ error: "Invalid token." });
    }

    // Search the token in the database
    const tokenExists = await ResetToken.findOne({ email: decoded.email });

    if (!tokenExists || tokenExists.token !== token) {
      return res.status(404).json({ error: "Wrong token!" });
    }

    // Check if the token has expired
    if (tokenExists.expiresAt < new Date()) {
      return res.status(404).json({ error: "Token has expired!" });
    }

    // If passed all of the above checks, we'll start the password reset process
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match!" });
    }

    // hash the password
    const hashedPassword = await hashPassword(password);

    // find the user
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      res.status(404).json({ error: "Email not found!" });
    }

    user!.password = hashedPassword;
    await user?.save();

    // delete the token from the db
    await tokenExists.deleteOne();

    res
      .status(200)
      .json({ message: "Your password have been updated successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

function logout(req: Request, res: Response) {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Logged out successfully!" });
}

export {
  login,
  socialCallback,
  register,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  logout,
};
