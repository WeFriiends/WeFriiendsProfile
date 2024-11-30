import { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import Profile from "../models/profileModel";
import { dateToZodiac } from "../services/dateToZodiac";
import { setLocation } from "../services/location";
import { ok } from "assert";
import fs from "fs";

const cloudinary = require('cloudinary').v2;

export const registerProfile = async (req: Request, res: Response) => {
  cloudinary.config({
    cloud_name: 'dm5trynua',
    api_key: '774866789288923',
    api_secret: 'r4viRDbd4z2Zs77WRl38TBVA6as',
  });
  const { name, dateOfBirth, location, reasons, gender } = req.body;
  const preferences = JSON.parse(req.body.preferences);
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;
  // Массив для хранения ссылок на загруженные файлы
  const uploadedFiles: string[] = [];
  console.log("profile controller", req.body);
  if (Array.isArray(req.files))
    req.files?.forEach((file) => {
      console.log(file.originalname);
    });
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = req.files as Express.Multer.File[];

    for (const file of files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "profile_pics",
        });

        uploadedFiles.push(result.secure_url);

        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`Failed to upload file ${file.filename}:`, error);
        throw error;
      }
    }
    
  } catch (error) {
    console.error("Error uploading files:", error);
    return res.status(500).json({ error: "Failed to upload files to Cloudinary" });
  }

  try {
    const zodiacSign = dateToZodiac(new Date(dateOfBirth));
    const newProfile = new Profile({
      //_id: userId,
      name,
      dateOfBirth,
      zodiacSign,
      location,
      gender,
      reasons,
      preferences,
      photos: uploadedFiles
    });
    await newProfile.save();

    res.status(201).json(newProfile);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error creating user", error });
  }
};

export const getCurrentProfile = async (req: Request, res: Response) => {
  console.log("GET profile controller");
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;

  try {
    const profile = await Profile.findById(userId).exec();
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving profile", error });
  }
};
// check up on updating name, dob, and zodiac sign. Is the code underneath correct?
export const updateProfile = async (req: Request, res: Response) => {
  const { gender, reasons, location } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;

  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      { gender, reasons, location },
      { new: true }
    ).exec();

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: "Error updating profile", error });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;

  try {
    await Profile.findByIdAndDelete(userId).exec();
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting profile", error });
  }
};
