import { NextFunction, Request, Response } from "express";
import * as photoService from "../services/photo";

export const handleUploadToCloudinary = async (req: Request, res: Response) => {
  try {
    const cloudinaryUrls = req.body.cloudinaryUrls;
    if (!cloudinaryUrls || cloudinaryUrls.length === 0) {
      console.error("No Cloudinary URLs found.");
      return res.status(500).send("Internal Server Error");
    }
    const images = cloudinaryUrls;
    return res.send(images);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const getPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const photos = await photoService.getPhotos(req.params.id);
    res.json(photos);
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
    const { id, photoUrl } = req.body;
    const photos = await photoService.addPhoto(id, photoUrl);
    res.json(photos);
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
    const { id, photoId } = req.body;
    const photos = await photoService.removePhoto(id, photoId);
    res.json(photos);
  } catch (error) {
    next(error);
  }
};
