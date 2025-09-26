import { Request, Response } from "express";
import { extractUserId, haversineDistance } from "../../utils";
import { ProfileService } from "./profile.service";
import { LikeService } from "../like/like.service";
import { Preferences } from "../../models";

export class ProfileController {
  private profileService: ProfileService;
  private likeService: LikeService;

  constructor(profileService: ProfileService, likeService: LikeService) {
    this.profileService = profileService;
    this.likeService = likeService;
  }

  registerProfile = async (req: Request, res: Response) => {
    console.log("controller registerProfile");

    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const { name, dateOfBirth, location, reasons, gender } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (!dateOfBirth) {
        return res.status(400).json({ error: "Date of birth is required" });
      }

      if (!gender) {
        return res.status(400).json({ error: "Gender is required" });
      }

      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      const preferences: Preferences =
        typeof req.body.preferences === "string"
          ? JSON.parse(req.body.preferences)
          : req.body.preferences || {};

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];

      const dateOfBirthObj = new Date(dateOfBirth);
      if (isNaN(dateOfBirthObj.getTime())) {
        return res
          .status(400)
          .json({ error: "Invalid date format for dateOfBirth" });
      }

      const newProfile = await this.profileService.registerProfile(
        userId,
        name,
        dateOfBirthObj,
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

  getCurrentProfile = async (req: Request, res: Response) => {
    console.log("controller getCurrentProfile");

    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const profile = await this.profileService.getProfileById(userId);
      return res.status(200).json(profile);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error retrieving profile", error });
    }
  };

  getProfileById = async (req: Request, res: Response) => {
    console.log("controller getProfileById");

    try {
      const userId = extractUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided" });
      }

      const targetUserId = req.params.userId;
      if (!targetUserId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const exists = await this.profileService.checkProfileExists(targetUserId);
      if (!exists) {
        return res
          .status(404)
          .json({ message: "User with provided ID doesn't exist" });
      }

      const targetUser = await this.profileService.getProfileById(targetUserId);
      const currentUser = await this.profileService.getProfileById(userId);

      const likesDoc = await this.likeService.getLikes(targetUser._id);
      const likedMe =
        likesDoc?.likes?.some((like) => like.liked_id === userId) || false;

      const targetUserObject = targetUser.toObject();
      const currentUserObject = currentUser.toObject();

      const performedUser = {
        _id: targetUserObject._id,
        name: targetUserObject.name,
        age: Math.round(
          new Date().getFullYear() - targetUserObject.dateOfBirth.getFullYear()
        ),
        zodiacSign: targetUserObject.zodiacSign,
        city: targetUserObject.location.city,
        distance: haversineDistance(
          targetUserObject.location.lat,
          targetUserObject.location.lng,
          currentUserObject.location.lat,
          currentUserObject.location.lng
        ),
        likedMe,
        photos: targetUserObject.photos.map((photo: string) => ({
          src: photo,
        })),
        reasons: targetUserObject.reasons,
        preferences: {
          questionary: {
            smoking: targetUserObject.preferences?.smoking[0] || "",
            education: targetUserObject.preferences?.educationalLevel,
            children: targetUserObject.preferences?.children[0] || "",
            drinking: targetUserObject.preferences?.drinking[0] || "",
            pets: targetUserObject.preferences?.pets,
            language: targetUserObject.preferences?.selectedLanguages,
          },
          interests: targetUserObject.preferences?.interests,
          aboutMe: targetUserObject.preferences?.aboutMe,
        },
      };

      return res.status(200).json(performedUser);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error retrieving profile", error });
    }
  };

  checkProfileExistsById = async (req: Request, res: Response) => {
    console.log("controller checkProfileExistsById");

    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const exists = await this.profileService.checkProfileExists(userId);
      return res.json(exists);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error retrieving profile", error });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    console.log("controller updateProfile");

    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const {
        reasons,
        preferences,
        location,
        photos,
        friendsDistance,
        friendsAgeMin,
        friendsAgeMax,
        blackList,
      } = req.body;

      const friendsDistanceNum = friendsDistance
        ? Number(friendsDistance)
        : undefined;
      const friendsAgeMinNum = friendsAgeMin
        ? Number(friendsAgeMin)
        : undefined;
      const friendsAgeMaxNum = friendsAgeMax
        ? Number(friendsAgeMax)
        : undefined;

      if (friendsDistanceNum !== undefined && isNaN(friendsDistanceNum)) {
        return res
          .status(400)
          .json({ error: "friendsDistance must be a number" });
      }

      if (friendsAgeMinNum !== undefined && isNaN(friendsAgeMinNum)) {
        return res
          .status(400)
          .json({ error: "friendsAgeMin must be a number" });
      }

      if (friendsAgeMaxNum !== undefined && isNaN(friendsAgeMaxNum)) {
        return res
          .status(400)
          .json({ error: "friendsAgeMax must be a number" });
      }

      const parsedPreferences =
        typeof preferences === "string" ? JSON.parse(preferences) : preferences;

      const updatedProfile = await this.profileService.updateProfile(
        userId,
        reasons,
        location,
        photos,
        friendsDistanceNum,
        friendsAgeMinNum,
        friendsAgeMaxNum,
        parsedPreferences,
        blackList
      );

      return res.status(200).json(updatedProfile);
    } catch (error) {
      return res.status(400).json({ message: "Error updating profile", error });
    }
  };

  deleteProfile = async (req: Request, res: Response) => {
    console.log("controller deleteProfile");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      await this.profileService.deleteProfile(userId);
      return res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
      return res.status(400).json({ message: "Error deleting profile", error });
    }
  };

  getAllProfiles = async (req: Request, res: Response) => {
    console.log("controller getAllProfiles");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const profiles = await this.profileService.getAllProfiles(userId);
      return res.status(200).json(profiles);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error retrieving profiles", error });
    }
  };

  searchFriends = async (req: Request, res: Response) => {
    console.log("controller searchFriends");

    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const friendsProfiles = await this.profileService.searchFriends(userId);
      return res.status(200).json(friendsProfiles);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error searching friends", error });
    }
  };

  getNearestProfiles = async (req: Request, res: Response) => {
    console.log("controller getNearestProfiles");

    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const nearestProfiles = await this.profileService.getNearestProfiles(
        userId
      );
      return res.status(200).json(nearestProfiles);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error getting nearest profiles", error });
    }
  };
}
