import { Request, Response } from "express";
import { Profile } from "../../models";
import { extractUserId, handleServiceError } from "../../utils";
import { DislikeService } from "./dislike.service";

export class DislikeController {
  private dislikeService: DislikeService;

  constructor(dislikeService: DislikeService) {
    this.dislikeService = dislikeService;
  }

  addDislike = async (req: Request, res: Response) => {
    console.log("controller addDislike");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const disliked_id = req.body.disliked_id;
      if (!disliked_id) {
        return res.status(400).json({ message: "disliked_id is required" });
      }

      const dislikedProfile = await Profile.findById(disliked_id).exec();
      if (!dislikedProfile) {
        return res.status(404).json({ message: "Disliked Profile not found" });
      }

      const dislikes = await this.dislikeService.addDislike(
        userId,
        disliked_id
      );
      return res.status(200).json(dislikes);
    } catch (error: unknown) {
      return handleServiceError(error, "Error addDislike", res);
    }
  };

  getDislikes = async (req: Request, res: Response) => {
    console.log("controller getDislikes");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const dislikes = await this.dislikeService.getDislikes(userId);
      return res.status(200).json(dislikes);
    } catch (error: unknown) {
      return handleServiceError(error, "Error getDislikes", res);
    }
  };

  removeDislike = async (req: Request, res: Response) => {
    console.log("controller removeDislike");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const disliked_id = req.body.disliked_id;

      if (!disliked_id) {
        return res
          .status(400)
          .json({ message: "Both disliker_id and disliked_id are required" });
      }

      const result = await this.dislikeService.removeDislike(
        userId,
        disliked_id
      );
      return res.status(200).json(result);
    } catch (error: unknown) {
      return handleServiceError(error, "Error removeDislike", res);
    }
  };
}
