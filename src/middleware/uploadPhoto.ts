import multer, { Multer } from "multer";
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  UploadApiOptions,
} from "cloudinary";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
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
  res: Response,
  next: NextFunction
) => {
  try {
    const files: CloudinaryFile[] = req.files as CloudinaryFile[];
    if (!files || files.length === 0) {
      return next(new Error("No files provided"));
    }

    const uploadPromises = files.map(async (file) => {
      const resizedBuffer: Buffer = await sharp(file.buffer)
        .resize({ width: 450, height: 535 })
        .toBuffer();

      return new Promise<string>((resolve, reject) => {
        const options: UploadApiOptions = {
          resource_type: "auto",
          folder: "profile-photos",
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (err) return reject(err);
            if (!result) return reject(new Error("Upload result is undefined"));
            resolve(result.secure_url);
          }
        );
        uploadStream.end(resizedBuffer);
      });
    });

    const cloudinaryUrls = await Promise.all(uploadPromises);
    req.body.cloudinaryUrls = cloudinaryUrls;
    next();
  } catch (error) {
    console.error("Error in uploadToCloudinary middleware:", error);
    next(error);
  }
};