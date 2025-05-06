import dotenv from "dotenv";
import { Request, Response } from "express";
import fs from "fs";
import moment from "moment";
import Profile from "../models/profileModel";
import { dateToZodiac } from "../services/dateToZodiac";
import { extractUserId } from "../utils/auth";
import { haversineDistance } from "../utils/distance";
import { LikesService } from "../services/likes.service";
import { friendSearchProjection } from "../models/profileProjections";

dotenv.config();
const cloudinary = require("cloudinary").v2;
const likesService = new LikesService();

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
    const profile = await Profile.findById(userId).exec();
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
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
    const profile = await Profile.findById(userId).exec();
    if (!profile) {
      return res.json(false);
    }
    return res.json(true);
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
      },
      { new: true }
    ).exec();

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
    await Profile.findByIdAndDelete(userId).exec();
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
    const profiles = await Profile.find({ _id: { $ne: userId } });
    return res.status(200).json(profiles);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error retrieving profiles", error });
  }
};

export const searchFriends = async (req: Request, res: Response) => {
  console.log("controller searchFriends");
  try {
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const profile = await Profile.findById(userId).exec();
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const lng = profile.location?.lng;
    const lat = profile.location?.lat;
    const friendsDistance = profile.friendsDistance;
    const friendsAgeMin = profile.friendsAgeMin;
    const friendsAgeMax = profile.friendsAgeMax;
    const blackList = profile.blackList || [];

    if (!lng || !lat || !friendsDistance || !friendsAgeMin || !friendsAgeMax) {
      return res
        .status(400)
        .json({ message: "Missing required fields in profile." });
    }

    const maxDate = moment().subtract(friendsAgeMin, "years").toDate();
    const minDate = moment().subtract(friendsAgeMax, "years").toDate();

    const allProfiles = await Profile.find(
      {
        _id: { $ne: userId, $nin: blackList },
        dateOfBirth: {
          $lte: maxDate,
          $gte: minDate,
        },
      },
      friendSearchProjection
    ).exec();

    console.log(`Found ${allProfiles.length} profiles matching age criteria`);

    const resultWithDistances = await Promise.all(
      allProfiles
        .filter((friend) => {
          if (!friend.location?.lat || !friend.location?.lng) return false;

          const distance = haversineDistance(
            lat,
            lng,
            friend.location.lat,
            friend.location.lng
          );
          return distance <= friendsDistance;
        })
        .map(async (friend) => {
          const likesDoc = await likesService.getLikes(friend._id);
          const likedMe =
            likesDoc?.likes?.some((like) => like.liked_id === userId) || false;

          const distance = haversineDistance(
            lat,
            lng,
            friend.location.lat,
            friend.location.lng
          );

          const friendObject = friend.toObject();

          return {
            likedMe,
            distance: Math.round(distance),
            city: friendObject.location?.city || "",
            photos: friendObject.photos?.map((photo) => ({ src: photo })) || [],
            preferences: {
              questionary: {
                smoking: friendObject.preferences?.Smoking || [],
                education: friendObject.preferences?.EducationalLevel || [],
                children: friendObject.preferences?.Children || [],
                drinking: friendObject.preferences?.Drinking || [],
                pets: friendObject.preferences?.Pets || [],
                languages: friendObject.preferences?.selectedLanguages || [],
              },
              interests: friendObject.preferences?.Interests || [],
              aboutMe: friendObject.preferences?.aboutMe || "",
            },
            age: moment().diff(moment(friendObject.dateOfBirth), "years"),
          };
        })
    );

    console.log(
      `Returning ${resultWithDistances.length} profiles after distance filtering`
    );
    return res.status(200).json(resultWithDistances);
  } catch (error) {
    console.error("Error searching friends:", error);
    return res.status(500).json({ message: "Error searching friends", error });
  }
};
