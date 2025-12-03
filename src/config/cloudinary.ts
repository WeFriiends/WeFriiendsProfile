import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const requiredEnvVars = {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: CLOUDINARY_${key.toUpperCase()}`);
  }
}

cloudinary.config(requiredEnvVars);

export default cloudinary;