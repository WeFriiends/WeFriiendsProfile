import { Request, Response } from "express";
import { jwtDecode } from "jwt-decode";
import Profile from "../models/profile";

export const registerProfile = async (req: Request, res: Response) => {
  const { name, dateOfBirth } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;

  try {
    const newProfile = new Profile({ _id: userId, name, dateOfBirth });
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ message: "Error creating user", error });
  }
};

export const getCurrentProfile = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;

  try {
    const profile = await Profile.findById(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving profile", error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { name, dateOfBirth } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken: any = jwtDecode(token!);
  const userId = decodedToken.sub;

  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      { name, dateOfBirth },
      { new: true }
    );
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
    await Profile.findByIdAndDelete(userId);
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting profile", error });
  }
};
