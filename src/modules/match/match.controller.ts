import { Request, Response } from "express";
import { Profile } from "../../models";
import { extractUserId, handleServiceError } from "../../utils";
import { MatchService } from "./match.service";

export class MatchController {
  private matchService: MatchService;

  constructor(matchService: MatchService) {
    this.matchService = matchService;
  }

  addMatch = async (req: Request, res: Response) => {
    console.log("controller addMatch");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const user2_id = req.body.user2_id;
      if (!user2_id) {
        return res.status(400).json({ message: "user2_id is required" });
      }

      const isUser2Exist = await Profile.findById(user2_id);
      if (!isUser2Exist) {
        return res
          .status(404)
          .json({ message: "User with this id doesn't exist" });
      }

      if (userId === user2_id) {
        return res
          .status(400)
          .json({ message: "Can not add yourself as a match" });
      }

      const newMatch = await this.matchService.addMatch(userId, user2_id);
      return res.status(200).json(newMatch);
    } catch (error: unknown) {
      return handleServiceError(error, "Error addMatch", res, 400);
    }
  };

  getMatches = async (req: Request, res: Response) => {
    console.log("controller getMatches");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const matches = await this.matchService.getMatches(userId);
      return res.status(200).json(matches);
    } catch (error: unknown) {
      return handleServiceError(error, "Error getMatches", res, 404);
    }
  };

  removeMatch = async (req: Request, res: Response) => {
    console.log("controller removeMatch");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const user2_id = req.body.user2_id;

      if (!user2_id) {
        return res.status(400).json({ message: "user2_id is required" });
      }

      const result = await this.matchService.removeMatch(userId, user2_id);
      return res.status(200).json(result);
    } catch (error: unknown) {
      return handleServiceError(error, "Error removeMatch", res, 404);
    }
  };

  editMatch = async (req: Request, res: Response) => {
    console.log("controller editMatch");
    const userId = extractUserId(req);
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    try {
      const { user2_id, user1_seen, user2_seen } = req.body;

      if (!user2_id || user1_seen === undefined || user2_seen === undefined) {
        return res.status(400).json({ message: "user2_id, user1_seen, and user2_seen are required" });
      }

      const result = await this.matchService.editMatch(userId, user2_id, user1_seen, user2_seen);
      return res.status(200).json(result);
    } catch (error: unknown) {
      return handleServiceError(error, "Error editMatch", res, 404);
    }
  };
}
