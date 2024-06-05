import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import connectToDB from "./config/db";
import { errorHandler, notFound } from "./middlewares/errorMiddleware";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import messageRouter from "./routes/messageRoutes";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import setupPassport from "./config/passport";
import multerErrorMiddleware from "./middlewares/multerMiddleware";

// Connect to db
connectToDB();

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(cookieParser());
app.use(passport.initialize());

// port
const port = process.env.PORT || 3000;

// passport setup
setupPassport();

//
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello world!</h1>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1", messageRouter);

// Error and not found middleware
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
