import moment from "moment";
import {
  Profile,
  friendSearchProjection,
  Location,
  Preferences,
  ProfileDocument,
} from "../../models";
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  UploadApiOptions,
} from "cloudinary";
import { dateToZodiac, haversineDistance, deleteAllMyCloudinaryImage, getAllMyCloudinaryImage } from "../../utils";
import { LikeService } from "../like/like.service";
import { MatchService } from "../match/match.service";
import { BlockService } from "../block/block.service";
import cloudinary from "../../config/cloudinary";
import NearestProfileDto from "./nearestProfile.dto";
import { DeletionStatus } from "./profile.model";
import { ChatService } from "../chat/chat.service";
import { deleteUserFromAuth0 } from "../../utils/deleteProfileAuth0"
import sharp from "sharp";

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
  private chatService: ChatService;

  constructor(
    likeService?: LikeService,
    matchService?: MatchService,
    blockService: BlockService = new BlockService(),
    chatService: ChatService = new ChatService()
  ) {
    this.likeService = likeService;
    this.matchService = matchService;
    this.blockService = blockService;
    this.chatService = chatService;
  }
  findProfileByDeviceId = async (deviceId: string): Promise<ProfileDocument | null> => {
    try{
      return await Profile.findOne({device_id: deviceId, deletionStatus: DeletionStatus.ACTIVE}).exec();
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

      if (!files || files.length === 0) {
        throw new Error("No files provided")
      }
  
      const MAX_SIZE = 5 * 1024 * 1024;
      const oversizedFile = files.find((file) => file.size > MAX_SIZE);
  
      if (oversizedFile) {
        throw new Error(`File ${oversizedFile.originalname} is too large. Max allowed size is 5MB.`)
      }
  
      const uploadPromises = files.map(async (file) => {
        if (!file.buffer || file.buffer.length === 0) {
          throw new Error("File buffer is empty");
        }
  
        const resizedBuffer: Buffer = await sharp(file.buffer)
          .resize({ width: 450, height: 535 })
          .jpeg({ quality: 80 })
          .toBuffer();
  
        return new Promise<string>((resolve, reject) => {
          const options: UploadApiOptions = {
            resource_type: "auto",
            folder: "profile-photos",
            tags: [userId],
          };
  
          const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (
              err: UploadApiErrorResponse | undefined,
              result: UploadApiResponse | undefined
            ) => {
              if (err) return reject(err);
              if (!result) return reject(new Error("Upload result is undefined"));
              resolve(result.secure_url);
            }
          );
          uploadStream.end(resizedBuffer);
        });
      });
  
      
      const uploadedFiles: string[] = await Promise.all(uploadPromises);

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

  updateProfile = async (
    userId: string,
    reasons: string[],
    location?: Location | string,
    photos?: string[],
    friendsDistance?: number,
    friendsAgeMin?: number,
    friendsAgeMax?: number,
    preferences?: Preferences
  ): Promise<ProfileDocument> => {
    try {
      const existingProfile = await Profile.findById(userId).exec();
      if (!existingProfile) {
        throw new Error("Profile not found");
      }

      const parsedReasons: string[] =
        typeof reasons === "string" ? JSON.parse(reasons) : reasons;

      const updateData: Partial<ProfileDocument> = {
        reasons: parsedReasons,
      };

      if (location !== undefined && location !== null) {
        updateData.location = toGeoJsonLocation(location);
      }

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

  startDeleteCurrentProfile = async (userId: string) => {
    let isMongoUpdated = false;
    let isChatsHidden = false;
    let isDeviceIdCleared = false;
    let deviceId: string | undefined;
    try {
      const updatedProfile = await Profile.findByIdAndUpdate(
        userId,
        {
          $set: { deletionStatus: DeletionStatus.PENDING_DELETION },
          $unset: { device_id: 1 },
        },
        { new: false }
      ).exec();

      if (!updatedProfile) {
        throw new Error("Profile not found");
      }

      isMongoUpdated = true;
      deviceId = updatedProfile.device_id;
      isDeviceIdCleared = !!deviceId;

      await this.chatService.hideUserChatsForDeletedUser(userId);
      isChatsHidden = true;
      await this.matchService?.hideDeletedUserMatches(userId);

      return { message: "Current profile deleted successfully" };
    } catch (error: unknown) {
      console.error("Failed to start profile deletion", {
        userId,
        isMongoUpdated,
        isChatsHidden,
        isDeviceIdCleared,
        error,
      });

      if (isChatsHidden) {
        try {
          await this.chatService.unhideUserChatsForDeletedUser(userId);
        } catch (chatRollbackErr) {
          console.error("Critical: [rollback] Failed to  unhide chats for user", userId, chatRollbackErr);
        }
      }

      if (isMongoUpdated) {
        try {
          const rollbackUpdate: Record<string, unknown> = {
            deletionStatus: DeletionStatus.ACTIVE,
          };
          if (isDeviceIdCleared && deviceId) {
            rollbackUpdate.device_id = deviceId;
          }
          await Profile.findByIdAndUpdate(
            userId,
            rollbackUpdate,
            { new: true }
          ).exec();
        } catch (rollbackError) {
          console.error("Critical: [rollback] Failed to rollback profile deletion status for user", userId, rollbackError);
        }
      }
      throw new Error("Error deleting profile");
    }
  };
  
  endDeleteCurrentProfile = async (userId: string) => {
    const session = await Profile.startSession();
    session.startTransaction();

    try {
      const deletedProfile = await Profile.findByIdAndDelete(userId, { session }).exec();

      if (!deletedProfile) {
        throw new Error(`Profile with ID ${userId} not found`);
      }

      await deleteUserFromAuth0(userId);

      await session.commitTransaction();
      session.endSession();

      return { message: "Current profile deleted successfully" };
    } catch (error: unknown) {
      await session.abortTransaction();
      session.endSession();

      console.error(`Transaction aborted for user ${userId} due to error:`, error);
      throw error;
    }
  };
  

  getAllProfiles = async (userId: string): Promise<ProfileDocument[]> => {
    try {
      return await Profile.find({ _id: { $ne: userId }, gender: "female", deletionStatus: DeletionStatus.ACTIVE }).exec();
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

      const excludedIds = await this.blockService.getBlockedUsers(userId);

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
          gender: "female",
          deletionStatus: DeletionStatus.ACTIVE,
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
      const blockedIds = new Set(await this.blockService.getBlockedUsers(userId));

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
              if (blockedIds.has(profile.id)) return null;
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


  getPendingDeletedProfiles = async (): Promise<ProfileDocument[]> => {
    try {
      return await Profile.find({ deletionStatus: DeletionStatus.PENDING_DELETION }).exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error retrieving profiles");
    }
  }; 

  removeAllUserPhotos = async (userId: string): Promise<void> => {
    try {
      await deleteAllMyCloudinaryImage(userId)

      const maxRetries = 3;
      let remainingPhotos: string[] = [];

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        remainingPhotos = await getAllMyCloudinaryImage(userId);
        if (remainingPhotos.length === 0) {
          return;
        }
      }
      
      throw new Error(`Failed to remove all photos for user ${userId}. Remaining: ${remainingPhotos.length}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error removing all user photos");
    }
  };
}
