import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname.replace("\\dist", ""), "../.env"),
});

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
import { app, server } from "./sockets/index";
// import multerErrorMiddleware from "./middlewares/multerMiddleware";

// Connect to db
// connectToDB();

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

// Api routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);

//  For deployments

app.use(express.static(path.join(path.resolve(), "/frontend/dist")));

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(path.resolve(), "frontend", "dist", "index.html"));
});

if (process.env.NODE_ENV === "development") {
  // Error and not found middleware
  app.use(notFound);
  app.use(errorHandler);
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
