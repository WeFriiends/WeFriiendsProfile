import multer, { Multer } from "multer";
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  UploadApiOptions,
} from "cloudinary";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import { extractUserId } from "../utils";

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
export const upload: Multer = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"));
    }
    
    // Sanitize filename to prevent path traversal
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (sanitizedName !== file.originalname) {
      file.originalname = sanitizedName;
    }
    
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userIdTag = userId.replace("|","_");
  try {
    const files = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : req.files
      ? Object.values(req.files).flat()
      : [];

    if (!files || files.length === 0) {
      req.cloudinaryUrls = [];
      return next(new Error("No files provided"));
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    const oversizedFile = files.find((file) => file.size > MAX_SIZE);

    if (oversizedFile) {
      return next(new Error(`File ${oversizedFile.originalname} is too large. Max allowed size is 5MB.`))
    }

    const uploadPromises = files.map(async (file) => {
      if (!file.buffer || file.buffer.length === 0) {
        throw new Error("File buffer is empty");
      }

      const resizedBuffer: Buffer = await sharp(file.buffer)
        .resize({ width: 450, height: 535 })
        .jpeg({ quality: 80 })
        .toBuffer();

      return new Promise<string>((resolve, reject) => {
        const options: UploadApiOptions = {
          resource_type: "auto",
          folder: "profile-photos",
          tags: [userIdTag],
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (
            err: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined
          ) => {
            if (err) return reject(err);
            if (!result) return reject(new Error("Upload result is undefined"));
            resolve(result.secure_url);
          }
        );
        uploadStream.end(resizedBuffer);
      });
    });

    const urls:string[] = await Promise.all(uploadPromises);
    req.cloudinaryUrls = urls;
    next();
  } catch (error) {
    const sanitizedError = error instanceof Error ? error.message.replace(/[<>"'&]/g, '') : 'Unknown error';
    console.error("Error in uploadToCloudinary middleware:", sanitizedError);
    next(new Error("File upload failed"));
  }
};
