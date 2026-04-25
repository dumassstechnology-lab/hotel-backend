// config/cloudinary.js
import dotenv from "dotenv";
dotenv.config(); // 🔴 MUST run first

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // optional but recommended
});

// TEST: print key (remove in production)
console.log("Cloudinary key loaded:", process.env.CLOUDINARY_API_KEY);

export default cloudinary;