import dotenv from "dotenv";
import { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import Profile from "../models/profileModel";
import { dateToZodiac } from "../services/dateToZodiac";
import fs from "fs";
import moment from "moment";

dotenv.config();

const cloudinary = require('cloudinary').v2;

export const registerProfile = async (req: Request, res: Response) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  const { name, dateOfBirth, location, reasons, gender } = req.body;
  const preferences = JSON.parse(req.body.preferences);
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;
  const uploadedFiles: string[] = [];
  
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
    const age = moment().diff(moment(dateOfBirth, "YYYY-MM-DD"), "years");
    const friendsAgeMin = age - 6;
    const friendsAgeMax = age + 6;
    
    const parsedLocation = JSON.parse(location);
    const geoLocation = {
      type: "Point",
      coordinates: [parsedLocation.lng, parsedLocation.lat],
    };
    console.log(friendsAgeMax, friendsAgeMin);
    const newProfile = new Profile({
      name,
      dateOfBirth,
      zodiacSign,
      location: geoLocation,
      gender,
      reasons,
      preferences,
      friendsAgeMin,
      friendsAgeMax,
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

export const updateProfile = async (req: Request, res: Response) => {
  const { gender, reasons, location, zodiacSign } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;

  try {
    const parsedLocation = location ? JSON.parse(location) : null;
    const geoLocation = parsedLocation
      ? { type: "Point", coordinates: [parsedLocation.lng, parsedLocation.lat] }
      : undefined;

    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      { gender, reasons, location: geoLocation, zodiacSign },
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
