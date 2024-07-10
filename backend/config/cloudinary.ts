import { v2 } from "cloudinary";
import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path: path.resolve(__dirname.replace("\\dist", ""), "../../.env"),
});

const cloudinary = v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
