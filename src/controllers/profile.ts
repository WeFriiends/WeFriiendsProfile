import { Request, Response } from "express";
import multer from "multer";
import { jwtDecode } from "jwt-decode";
import Profile from "../models/profileModel";
import { dateToZodiac } from "../services/dateToZodiac";
import { setLocation } from "../services/location";
import { ok } from "assert";

const upload = multer({ dest: 'uploads/' });

export const registerProfile = async (req: Request, res: Response) => {
  const { name, dateOfBirth, location, reasons, gender } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;
  console.log('profile controller', req.body);
  return res.json({ok: true});

  try {
    const zodiacSign = dateToZodiac(new Date(dateOfBirth));
    const newProfile = new Profile({
      _id: userId,
      name,
      dateOfBirth,
      zodiacSign,
      location,
      gender,
      reasons,
    });
    await newProfile.save();

    res.status(201).json(newProfile);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error creating user", error });
  }
};

export const getCurrentProfile = async (req: Request, res: Response) => {
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
