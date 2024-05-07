import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";

import bodyParser from "body-parser";
import connectToDB from "./config/db";
import { errorHandler, notFound } from "./middlewares/errorMiddleware";
import authRouter from "./routes/authRoutes";
import usersRouter from "./routes/usersRoute";
import cors from "cors";
import cookieParser from "cookie-parser";
// Connect to db
connectToDB();

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParser());

// port
const port = process.env.PORT || 3000;

//
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello world!</h1>");
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

// Error and not found middleware
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
