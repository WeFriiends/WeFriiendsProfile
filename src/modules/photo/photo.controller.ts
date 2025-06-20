import { NextFunction, Request, Response } from "express";
import * as photoService from "./photo.service";
import { extractUserId } from "../../utils";

export const handleUploadToCloudinary = async (req: Request, res: Response) => {
  const { cloudinaryUrls } = req.body;
  if (!cloudinaryUrls?.length) {
    return res.status(400).json({ error: "No Cloudinary URLs provided" });
  }
  return res.json(cloudinaryUrls);
};

export const getPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const photos = await photoService.getPhotos(userId);
    return res.json(photos);
  } catch (error) {
    next(error);
  }
};

export const addPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl) {
      return res.status(400).json({ error: "Photo URL is required" });
    }
    const userId = extractUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const photos = await photoService.addPhoto(userId, photoUrl);
    return res.json(photos);
  } catch (error) {
    next(error);
  }
};

export const removePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl) {
      return res.status(400).json({ error: "Phot URL is required" });
    }

    const userId = extractUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const photos = await photoService.removePhoto(userId, photoUrl);
    return res.json(photos);
  } catch (error) {
    next(error);
  }
};
