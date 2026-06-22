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
import { BlockService } from "../block/block.service";
import cloudinary from "../../config/cloudinary";
import NearestProfileDto from "./nearestProfile.dto";

/**
 * Normalise any incoming location value to the canonical GeoJSON shape:
 * { type: "Point", coordinates: [lng, lat], country, city, street?, houseNumber? }
 *
 * Accepts:
 *  - A JSON string  (e.g. '{"lat":48.85,"lng":2.34,...}')
 *  - An object with lat/lng fields  (old format)
 *  - An object already in GeoJSON format  (coordinates array present)
 */
function toGeoJsonLocation(raw: Location | string): Location {
  const parsed: any = typeof raw === "string" ? JSON.parse(raw) : raw;

  const coordinates: [number, number] = Array.isArray(parsed.coordinates)
    ? [parsed.coordinates[0], parsed.coordinates[1]] // already GeoJSON
    : [parsed.lng, parsed.lat]; // old {lat, lng} format

  return {
    type: "Point",
    coordinates,
    country: parsed.country ?? "",
    city: parsed.city ?? "",
    ...(parsed.street !== undefined && { street: parsed.street }),
    ...(parsed.houseNumber !== undefined && { houseNumber: parsed.houseNumber }),
  };
}

export class ProfileService {
  private likeService?: LikeService;
  private matchService?: MatchService;
  private blockService: BlockService;

  constructor(
    likeService?: LikeService,
    matchService?: MatchService,
    blockService: BlockService = new BlockService()
  ) {
    this.likeService = likeService;
    this.matchService = matchService;
    this.blockService = blockService;
  }
  findProfileByDeviceId = async (deviceId: string): Promise<ProfileDocument | null> => {
    try{
      return await Profile.findOne({device_id: deviceId}).exec();
    }catch(error: unknown) {
      if(error instanceof Error) throw new Error (error.message);
      throw new Error("Error finding profile by device_id");
    }
  };

  registerProfile = async (
    userId: string,
    name: string,
    dateOfBirth: Date,
    location: Location,
    reasons: string[],
    gender: string,
    preferences: Preferences,
    files: Express.Multer.File[],
    deviceId? : string 
  ) => {
    try {
      const existingProfile = await Profile.findById(userId).exec();
      if (existingProfile && existingProfile.isProfileComplete) {
        throw new Error("Profile already exists");
      }

      const uploadedFiles: string[] = [];

      if (!files || files.length === 0) {
        throw new Error("No files uploaded");
      }

      for (const file of files) {
        try {
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
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

      const parsedLocation: Location = toGeoJsonLocation(location);

      const parsedReasons: string[] =
        typeof reasons === "string" ? JSON.parse(reasons) : reasons;
        
        if(existingProfile){
          return await Profile.findByIdAndUpdate(
            userId,
            {
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
              isProfileComplete: true,
              ...(deviceId && {device_id: deviceId}),
            },
            {new:true}
          ).exec();
        }

      const newProfile = new Profile({
        _id: userId,
        device_id: deviceId,
        isProfileComplete: true,
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

      const parsedLocation: Location = toGeoJsonLocation(location);

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
          pets: existingProfile.preferences?.pets || [],
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

      const lng = profile.location?.coordinates?.[0];
      const lat = profile.location?.coordinates?.[1];
      const friendsDistance = profile.friendsDistance;
      const friendsAgeMin = profile.friendsAgeMin;
      const friendsAgeMax = profile.friendsAgeMax;
      const blackList = profile.blackList || [];

      const blockedUserIds = await this.blockService.getBlockedUsers(userId);
      const hiddenByOthers = await Profile.find({ blackList: userId })
        .select("_id")
        .lean<{ _id: string }[]>();
      const hiddenByOthersIds = hiddenByOthers.map((p) => p._id);
      const excludedIds = Array.from(
        new Set([...blackList, ...blockedUserIds, ...hiddenByOthersIds])
      );

      if (
        lng === undefined ||
        lat === undefined ||
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
          _id: { $ne: userId, $nin: excludedIds },
          dateOfBirth: {
            $lte: maxDate,
            $gte: minDate,
          },
        },
        friendSearchProjection
      ).exec();

      console.log(`Found ${allProfiles.length} profiles matching age criteria`);

      const userLikes = this.likeService ? await this.likeService.getLikes(userId) : null;

      const filteredProfiles = await Promise.all(
        allProfiles.map(async (friend) => {
          const hasLiked = userLikes?.likes?.some(
            (like) => like.liked_id === friend.id
          );
          const hasMatch = await this.matchService?.hasMatch(userId, friend.id);
          const hasValidLocation =
            friend.location?.coordinates?.[0] !== undefined &&
            friend.location?.coordinates?.[1] !== undefined;

          if (hasLiked || hasMatch || !hasValidLocation) return null;

          const distance = haversineDistance(
            lat,
            lng,
            friend.location.coordinates[1],
            friend.location.coordinates[0]
          );

          if (distance > friendsDistance) return null;

          return friend;
        })
      );

      const validProfiles = filteredProfiles.filter(
        (friend): friend is NonNullable<typeof friend> => friend !== null
      );
      if (validProfiles.length === 0) {
        return [];
      }

      const resultWithDistances = await Promise.all(
        validProfiles.map(async (friend) => {
          const likesDoc = this.likeService ? await this.likeService.getLikes(friend._id) : null;
          const likedMe =
            likesDoc?.likes?.some((like) => like.liked_id === userId) || false;

          const distance = haversineDistance(
            lat,
            lng,
            friend.location.coordinates[1],
            friend.location.coordinates[0]
          );

          const friendObject = friend.toObject();

          return {
            id: friendObject._id,
            reasons: friendObject.reasons,
            name: friendObject.name,
            zodiacSign: friendObject.zodiacSign,
            likedMe,
            distance,
            city: friendObject.location?.city || "",
            photos: friendObject.photos || [],
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

  getNearestProfiles = async (userId: string) => {
    try {
      const currentProfile = await Profile.findById(userId).exec();
      if (
        !currentProfile ||
        !currentProfile.location?.coordinates?.length
      ) {
        throw new Error("Profile or location not found");
      }

      const allProfiles = await this.getAllProfiles(userId);

      const userLikes = this.likeService ? await this.likeService.getLikes(userId) : null;

      const nearestProfiles = await Promise.all(
        allProfiles
          .filter(
            (profile) =>
              profile.location?.coordinates?.[0] !== undefined &&
              profile.location?.coordinates?.[1] !== undefined
          )
          .map(async (profile) => {
            const distance = haversineDistance(
              currentProfile.location.coordinates[1],
              currentProfile.location.coordinates[0],
              profile.location.coordinates[1],
              profile.location.coordinates[0]
            );

            if (distance <= currentProfile.friendsDistance!) {
              const hasLiked = userLikes?.likes?.some((like) => like.liked_id === profile.id);
              const hasMatch = await this.matchService?.hasMatch(userId, profile.id);
              if (hasLiked || hasMatch) return null;

              const profileLikes = this.likeService ? await this.likeService.getLikes(profile.id) : { likes: [] };
              return {
                id: profile.id,
                name: profile.name,
                distance,
                picture: profile.photos?.[0] || null,
                likedMe: profileLikes.likes.some(
                  (obj) => obj.liked_id === currentProfile.id
                ),
              } as NearestProfileDto;
            }
            return null;
          })
      );

      return nearestProfiles.filter((profile) => profile !== null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error retrieving nearest profiles");
    }
  };
}
