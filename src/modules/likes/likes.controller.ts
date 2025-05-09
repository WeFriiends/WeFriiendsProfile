import { Request, Response } from "express";
import Profile from "../../models/profile.model";
import { extractUserId } from "../../utils/extractUserId";
import { LikesService } from "./likes.service";

export class LikesController {
  private likesService: LikesService;

  constructor(likesService: LikesService) {
    this.likesService = likesService;
  }

  addLike = async (req: Request, res: Response) => {
    console.log("controller addLike");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const liked_id = req.body.liked_id;
      if (!liked_id) {
        return res.status(400).json({ message: "liked_id is required" });
      }

      const likedProfile = await Profile.findById(liked_id).exec();
      if (!likedProfile) {
        return res.status(404).json({ message: "Liked Profile not found" });
      }

      const likes = await this.likesService.addLike(userId, liked_id);
      return res.status(200).json(likes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  };

  getLikes = async (req: Request, res: Response) => {
    console.log("controller getLikes");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const likes = await this.likesService.getLikes(userId);
      return res.status(200).json(likes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  };

  removeLike = async (req: Request, res: Response) => {
    console.log("controller removeLike");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const liked_id = req.body.liked_id;

      if (!liked_id) {
        return res
          .status(400)
          .json({ message: "Both liker_id and liked_id are required" });
      }

      const result = await this.likesService.removeLike(userId, liked_id);
      return res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  };
}
