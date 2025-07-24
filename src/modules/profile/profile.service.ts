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
import { LikeService } from "../like/like.service";
import { MatchService } from "../match/match.service";
import cloudinary from "../../config/cloudinary";

export class ProfileService {
  private likeService: LikeService;
  private matchService?: MatchService;

  constructor(likeService: LikeService, matchService?: MatchService) {
    this.likeService = likeService;
    this.matchService = matchService;
  }

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
      const profileExists = await this.checkProfileExists(userId);
      if (profileExists) {
        throw new Error("Profile already exists");
      }

      const uploadedFiles: string[] = [];

      if (!files || files.length === 0) {
        throw new Error("No files uploaded");
      }

      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
              folder: "profile_pics",
            }
          );
          uploadedFiles.push(result.secure_url);
        } catch (error) {
          console.error(`Failed to upload file ${file.originalname}:`, error);
          throw new Error(`Failed to upload file ${file.originalname}`);
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
      if (typeof Profile.findById !== "function") {
        console.error("Profile.findById is not a function");
        return false;
      }
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
    photos?: string[],
    friendsDistance?: number,
    friendsAgeMin?: number,
    friendsAgeMax?: number,
    preferences?: Preferences,
    blackList?: string[] | string
  ): Promise<ProfileDocument> => {
    try {
      const existingProfile = await Profile.findById(userId).exec();
      if (!existingProfile) {
        throw new Error("Profile not found");
      }

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

      if (photos && photos.length > 0) {
        updateData.photos = photos;
      }

      if (friendsDistance !== undefined) {
        updateData.friendsDistance = friendsDistance;
      }

      if (preferences !== undefined) {
        const parsedPreferences =
          typeof preferences === "string"
            ? JSON.parse(preferences)
            : preferences;

        const updatedPreferences: Preferences = {
          aboutMe: existingProfile.preferences?.aboutMe || "",
          selectedLanguages:
            existingProfile.preferences?.selectedLanguages || [],
          smoking: existingProfile.preferences?.smoking || [],
          educationalLevel: existingProfile.preferences?.educationalLevel || [],
          children: existingProfile.preferences?.children || [],
          drinking: existingProfile.preferences?.drinking || [],
          Pets: existingProfile.preferences?.pets || [],
          interests: existingProfile.preferences?.interests || [],
          ...(parsedPreferences || {}),
        };

        updateData.preferences = updatedPreferences;
      }

      if (friendsAgeMin !== undefined) {
        updateData.friendsAgeMin = friendsAgeMin;
      }

      if (friendsAgeMax !== undefined) {
        updateData.friendsAgeMax = friendsAgeMax;
      }

      if (parsedBlackList && parsedBlackList.length > 0) {
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

      const userLikes = await this.likeService.getLikes(userId);
      const userMatches = this.matchService
        ? await this.matchService.getMatches(userId)
        : [];

      const resultWithDistances = await Promise.all(
        allProfiles
          .filter((friend) => {
            return (
              !userLikes?.likes?.some((like) => like.liked_id === friend.id) &&
              !userMatches?.some((match) => match.id === friend.id)
            );
          })
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
            const likesDoc = await this.likeService.getLikes(friend._id);
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
                  smoking: friendObject.preferences?.smoking || [],
                  education: friendObject.preferences?.educationalLevel || [],
                  children: friendObject.preferences?.children || [],
                  drinking: friendObject.preferences?.drinking || [],
                  pets: friendObject.preferences?.pets || [],
                  languages: friendObject.preferences?.selectedLanguages || [],
                },
                interests: friendObject.preferences?.interests || [],
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
