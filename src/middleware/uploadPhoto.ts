import multer, { Multer } from "multer";
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  UploadApiOptions,
} from "cloudinary";
import sharp from "sharp";
import { Request, NextFunction } from "express";
import cloudinary from "../config/cloudinary";

interface CloudinaryFile extends Express.Multer.File {
  buffer: Buffer;
}

interface CustomRequest extends Request {
  files?: CloudinaryFile[];
  body: {
    cloudinaryUrls?: string[];
  };
}

const storage = multer.memoryStorage();
export const upload: Multer = multer({ storage: storage });

export const uploadToCloudinary = async (
  req: CustomRequest,
  next: NextFunction
) => {
  try {
    const files: CloudinaryFile[] = req.files as CloudinaryFile[];
    if (!files || files.length === 0) {
      return next(new Error("No files provided"));
    }
    const cloudinaryUrls: string[] = [];
    let processedFiles = 0;

    for (const file of files) {
      const resizedBuffer: Buffer = await sharp(file.buffer)
        .resize({ width: 450, height: 535 })
        .toBuffer();

      const options: UploadApiOptions = {
        resource_type: "auto",
        folder: "profile-photos",
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (
          err: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (err) {
            console.error("Cloudinary upload error:", err);
            return next(err);
          }
          if (!result) {
            console.error("Cloudinary upload error: Result is undefined");
            return next(new Error("Cloudinary upload result is undefined"));
          }
          cloudinaryUrls.push(result.secure_url);
          processedFiles++;

          if (processedFiles === files.length) {
            req.body.cloudinaryUrls = cloudinaryUrls;
            next();
          }
        }
      );
      uploadStream.end(resizedBuffer);
    }
  } catch (error) {
    console.error("Error in uploadToCloudinary middleware:", error);
    next(error);
  }
};