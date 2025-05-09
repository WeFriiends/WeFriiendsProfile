import dotenv from "dotenv";
import fs from "fs";
import moment from "moment";
import {
  Profile,
  friendSearchProjection,
  Location,
  Preferences,
  ProfileDocument,
} from "../../models";
import { dateToZodiac, haversineDistance } from "../../utils";
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
    dateOfBirth: Date,
    location: Location,
    reasons: string[],
    gender: string,
    preferences: Preferences,
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

      const zodiacSign = dateToZodiac(dateOfBirth);
      const age = moment().diff(moment(dateOfBirth), "years");
      const friendsAgeMin = age - 6;
      const friendsAgeMax = age + 6;

      const parsedLocation: Location =
        typeof location === "string" ? JSON.parse(location) : location;

      const parsedReasons: string[] =
        typeof reasons === "string" ? JSON.parse(reasons) : reasons;

      const newProfile = new Profile({
        _id: userId,
        name,
        dateOfBirth,
        zodiacSign,
        location: parsedLocation,
        gender,
        reasons: parsedReasons,
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

  getProfileById = async (userId: string): Promise<ProfileDocument> => {
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
    reasons: string[],
    location: Location | string,
    friendsDistance?: number,
    friendsAgeMin?: number,
    friendsAgeMax?: number,
    blackList?: string[] | string
  ): Promise<ProfileDocument> => {
    try {
      const parsedReasons: string[] =
        typeof reasons === "string" ? JSON.parse(reasons) : reasons;

      const parsedLocation: Location =
        typeof location === "string" ? JSON.parse(location) : location;

      const parsedBlackList: string[] =
        typeof blackList === "string" ? JSON.parse(blackList) : blackList;

      const updateData: Partial<ProfileDocument> = {
        reasons: parsedReasons,
        location: parsedLocation,
      };

      if (friendsDistance !== undefined) {
        updateData.friendsDistance = friendsDistance;
      }

      if (friendsAgeMin !== undefined) {
        updateData.friendsAgeMin = friendsAgeMin;
      }

      if (friendsAgeMax !== undefined) {
        updateData.friendsAgeMax = friendsAgeMax;
      }

      if (parsedBlackList.length > 0) {
        updateData.blackList = parsedBlackList;
      }

      const updatedProfile = await Profile.findByIdAndUpdate(
        userId,
        updateData,
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

  getAllProfiles = async (userId: string): Promise<ProfileDocument[]> => {
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
