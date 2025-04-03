import dotenv from "dotenv";
import { Request, Response } from "express";
import Profile from "../models/profileModel";
import { dateToZodiac } from "../services/dateToZodiac";
import fs from "fs";
import moment from "moment";
import { extractUserId } from "../utils/auth";
import { searchingFriendsDto } from "../types/searchingFriends.dto";

dotenv.config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

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
  const uploadedFiles: string[] = [];

  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
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
      }
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    return res
      .status(500)
      .json({ error: "Failed to upload files to Cloudinary" });
  }

  console.log("controller registerProfile: photos uploaded");

  const zodiacSign = dateToZodiac(new Date(dateOfBirth));
  const age = moment().diff(moment(dateOfBirth, "YYYY-MM-DD"), "years");
  const friendsAgeMin = age - 6;
  const friendsAgeMax = age + 6;

  const newProfile = new Profile({
    _id: userId,
    name,
    dateOfBirth,
    zodiacSign,
    location: typeof location === "string" ? JSON.parse(location) : location,
    gender,
    reasons,
    preferences,
    friendsAgeMin,
    friendsAgeMax,
    photos: uploadedFiles,
  });

  try {
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error creating user", error });
  }
};

export const getCurrentProfile = async (req: Request, res: Response) => {
  console.log("controller getCurrentProfile");

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

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

const getProfileByID = async (userId: string) => {
  console.log("controller getProfileByID");

  return await Profile.findById(userId).exec();
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
    friends,
    preferences,
  } = req.body;

  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      userId,
      {
        gender,
        reasons,
        location:
          typeof location === "string" ? JSON.parse(location) : location,
        friendsDistance,
        friendsAgeMin,
        friendsAgeMax,
        blackList:
          typeof blackList === "string" ? JSON.parse(blackList) : blackList,
        friends: typeof friends === "string" ? JSON.parse(friends) : friends,
        preferences:
          typeof preferences === "string"
            ? JSON.parse(preferences)
            : preferences,
      },
      { new: true }
    ).exec();

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ message: "Error updating profile", error });
  }
};

export const addFriend = async (req: Request, res: Response) => {
  console.log("controller addFriend");

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const newFriendID = req.body.id;
  if (!newFriendID) {
    return res.status(400).json({ message: "ID is required" });
  }

  if (userId === newFriendID) {
    return res.status(400).json({ message: "Cannot add yourself as a friend" });
  }

  try {
    const userProfile = await getProfileByID(userId);
    const newFriendsProfile = await getProfileByID(newFriendID);

    if (!newFriendsProfile) {
      return res.status(404).json({ message: "Friend's profile not found" });
    }

    if (!userProfile) {
      return res.status(404).json({ message: "Your profile not found" });
    }

    if (userProfile.friends?.some((friend) => friend._id === newFriendID)) {
      return res.status(400).json({ message: "Already in your friends list" });
    }

    if (newFriendsProfile.friends?.some((friend) => friend._id === userId)) {
      return res.status(400).json({ message: "Already in their friends list" });
    }

    await Profile.findByIdAndUpdate(
      userId,
      {
        friends: [
          ...(userProfile.friends || []),
          { _id: newFriendID, dateOfFriendship: new Date() },
        ],
      },
      { new: true }
    ).exec();

    const friendUpdatedProfile = await Profile.findByIdAndUpdate(
      newFriendID,
      {
        friends: [
          ...(newFriendsProfile.friends || []),
          { _id: userId, dateOfFriendship: new Date() },
        ],
      },
      { new: true }
    ).exec();

    return res.status(200).json(friendUpdatedProfile);
  } catch (error) {
    return res.status(400).json({ message: "Error updating profile", error });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    await Profile.findByIdAndDelete(userId).exec();
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting profile", error });
  }
};

export const getAllProfiles = async (req: Request, res: Response) => {
  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const profiles = await Profile.find({ _id: { $ne: userId } });
    res.status(200).json(profiles);
  } catch (error) {
    res.status(400).json({ message: "Error retrieving profiles", error });
  }
};

export const searchFriends = async (req: Request, res: Response) => {
  const {
    lat,
    lng,
    friendsAgeMin,
    friendsAgeMax,
    friendsDistance,
  }: searchingFriendsDto = req.body;

  if (!lat || !lng || !friendsAgeMin || !friendsAgeMax || !friendsDistance) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const searchingResult = await Profile.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: friendsDistance * 1000,
        },
      },
      dateOfBirth: {
        $lte: moment().subtract(friendsAgeMin, "years").toDate(),
        $gte: moment().subtract(friendsAgeMax, "years").toDate(),
      },
    });

    res.status(200).json(searchingResult);
  } catch (error) {
    res.status(500).json({ message: "Error searching friends", error });
  }
};
