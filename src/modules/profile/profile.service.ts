import dotenv from "dotenv";
import fs from "fs";
import moment from "moment";
import Profile from "../../models/profileModel";
import { dateToZodiac } from "../../utils/dateToZodiac";
import { friendSearchProjection } from "../../models/profileProjections";
import { haversineDistance } from "../../utils/haversineDistance";
import { LikesService } from "../likes/likes.service";

dotenv.config();
const cloudinary = require("cloudinary").v2;
const likesService = new LikesService();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export class ProfileService {
  registerProfile = async (
    userId: string,
    name: string,
    dateOfBirth: string,
    location: any,
    reasons: any,
    gender: string,
    preferences: any,
    files: Express.Multer.File[]
  ) => {
    try {
      const uploadedFiles: string[] = [];

      if (!files || files.length === 0) {
        throw new Error("No files uploaded");
      }

      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "profile_pics",
          });
          uploadedFiles.push(result.secure_url);
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(`Failed to upload file ${file.filename}:`, error);
          throw new Error(`Failed to upload file ${file.filename}`);
        }
      }

      console.log("ProfileService: photos uploaded");

      const zodiacSign = dateToZodiac(new Date(dateOfBirth));
      const age = moment().diff(moment(dateOfBirth, "YYYY-MM-DD"), "years");
      const friendsAgeMin = age - 6;
      const friendsAgeMax = age + 6;

      const newProfile = new Profile({
        _id: userId,
        name,
        dateOfBirth,
        zodiacSign,
        location:
          typeof location === "string" ? JSON.parse(location) : location,
        gender,
        reasons,
        preferences,
        friendsAgeMin,
        friendsAgeMax,
        photos: uploadedFiles,
      });

      return await newProfile.save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error creating profile");
    }
  };

  getProfileById = async (userId: string) => {
    try {
      const profile = await Profile.findById(userId).exec();
      if (!profile) {
        throw new Error("Profile not found");
      }
      return profile;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error retrieving profile");
    }
  };

  checkProfileExists = async (userId: string): Promise<boolean> => {
    try {
      const profile = await Profile.findById(userId).exec();
      return !!profile;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error checking profile existence");
    }
  };

  updateProfile = async (
    userId: string,
    gender: string,
    reasons: any,
    location: any,
    friendsDistance: number,
    friendsAgeMin: number,
    friendsAgeMax: number,
    blackList: string[]
  ) => {
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

      if (!updatedProfile) {
        throw new Error("Profile not found");
      }

      return updatedProfile;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error updating profile");
    }
  };

  deleteProfile = async (userId: string) => {
    try {
      const result = await Profile.findByIdAndDelete(userId).exec();
      if (!result) {
        throw new Error("Profile not found");
      }
      return { message: "Profile deleted successfully" };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error deleting profile");
    }
  };

  getAllProfiles = async (userId: string) => {
    try {
      return await Profile.find({ _id: { $ne: userId } });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error retrieving profiles");
    }
  };

  searchFriends = async (userId: string) => {
    try {
      const profile = await Profile.findById(userId).exec();
      if (!profile) {
        throw new Error("Profile not found");
      }

      const lng = profile.location?.lng;
      const lat = profile.location?.lat;
      const friendsDistance = profile.friendsDistance;
      const friendsAgeMin = profile.friendsAgeMin;
      const friendsAgeMax = profile.friendsAgeMax;
      const blackList = profile.blackList || [];

      if (
        !lng ||
        !lat ||
        !friendsDistance ||
        !friendsAgeMin ||
        !friendsAgeMax
      ) {
        throw new Error("Missing required fields in profile");
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
              likesDoc?.likes?.some((like) => like.liked_id === userId) ||
              false;

            const distance = haversineDistance(
              lat,
              lng,
              friend.location.lat,
              friend.location.lng
            );

            const friendObject = friend.toObject();

            return {
              _id: friendObject._id,
              reasons: friendObject.reasons,
              name: friendObject.name,
              zodiacSign: friendObject.zodiacSign,
              likedMe,
              distance: Math.round(distance),
              city: friendObject.location?.city || "",
              photos:
                friendObject.photos?.map((photo) => ({ src: photo })) || [],
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

      return resultWithDistances;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error searching friends");
    }
  };
}
