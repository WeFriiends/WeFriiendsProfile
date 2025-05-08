import { Request, Response } from "express";
import { extractUserId } from "../../utils/extractUserId";
import { ProfileService } from "./profile.service";

const profileService = new ProfileService();

export const registerProfile = async (req: Request, res: Response) => {
  console.log("controller registerProfile");

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const { name, dateOfBirth, location, reasons, gender } = req.body;
  const preferences =
    typeof req.body.preferences === "string"
      ? JSON.parse(req.body.preferences)
      : req.body.preferences;

  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = req.files as Express.Multer.File[];
    const newProfile = await profileService.registerProfile(
      userId,
      name,
      dateOfBirth,
      location,
      reasons,
      gender,
      preferences,
      files
    );

    return res.status(201).json(newProfile);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error creating user", error });
  }
};

export const getCurrentProfile = async (req: Request, res: Response) => {
  console.log("controller getCurrentProfile");

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const profile = await profileService.getProfileById(userId);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(400).json({ message: "Error retrieving profile", error });
  }
};

export const checkProfileExistsById = async (req: Request, res: Response) => {
  console.log("controller checkProfileExistsById");

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const exists = await profileService.checkProfileExists(userId);
    return res.json(exists);
  } catch (error) {
    return res.status(400).json({ message: "Error retrieving profile", error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  console.log("controller updateProfile");

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const {
    gender,
    reasons,
    location,
    friendsDistance,
    friendsAgeMin,
    friendsAgeMax,
    blackList,
  } = req.body;

  try {
    const updatedProfile = await profileService.updateProfile(
      userId,
      gender,
      reasons,
      location,
      friendsDistance,
      friendsAgeMin,
      friendsAgeMax,
      blackList
    );

    return res.status(200).json(updatedProfile);
  } catch (error) {
    return res.status(400).json({ message: "Error updating profile", error });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  console.log("controller deleteProfile");
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    await profileService.deleteProfile(userId);
    return res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Error deleting profile", error });
  }
};

export const getAllProfiles = async (req: Request, res: Response) => {
  console.log("controller getAllProfiles");
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const profiles = await profileService.getAllProfiles(userId);
    return res.status(200).json(profiles);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error retrieving profiles", error });
  }
};

export const searchFriends = async (req: Request, res: Response) => {
  console.log("controller searchFriends");
  
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const friendsProfiles = await profileService.searchFriends(userId);
    return res.status(200).json(friendsProfiles);
  } catch (error) {
    return res.status(400).json({ message: "Error searching friends", error });
  }
};