import { Request, Response } from "express";
import Profile from "../models/profileModel";
import { extractUserId } from "../utils/auth";
import { Friend } from "../types/Friend.dto";

export const getFriends = async (req: Request, res: Response) => {
  console.log("controller getFriends");

  const userId = extractUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const profile = await Profile.findById(userId).exec();
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const friendsIds =
      profile.friends
        ?.sort(
          (a, b) => b.dateOfFriendship.getTime() - a.dateOfFriendship.getTime()
        )
        .map((friend) => friend._id) || [];

    const friends = await Promise.all(
      friendsIds.map((friendId) => Profile.findById(friendId).exec())
    );

    const result: Friend[] = friends
      .map(
        (friend) =>
          friend && {
            _id: friend._id,
            name: friend.name,
            age: new Date().getFullYear() - friend.dateOfBirth.getFullYear(),
            photos: friend.photos || [],
          }
      )
      .filter((friend): friend is Friend => friend !== null);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving profile", error });
  }
};
