import { Request, Response } from "express";
import { MatchService } from "./match.service";
import { extractUserId } from "../../utils/extractUserId";
import { getPublicKey } from "../../config/webpush";

export class MatchController {
  private matchService: MatchService;

  constructor(matchService: MatchService = new MatchService()) {
    this.matchService = matchService;
  }

  addMatch = async (req: Request, res: Response) => {
    try {
      const user1_id = extractUserId(req);
      const { user2_id } = req.body;

      if (!user2_id) {
        return res.status(400).json({ message: "user2_id is required" });
      }
      if (!user1_id) {
        return res.status(400).json({ message: "user_id is required" });
      }

      const match = await this.matchService.addMatch(user1_id, user2_id);

      const newMatch = await this.matchService.addMatch(user1_id, user2_id);
      return res.status(200).json(newMatch);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  };

  getMatches = async (req: Request, res: Response) => {
    try {
      const user_id = extractUserId(req);

      if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
      }
      const matches = await this.matchService.getMatches(user_id);

      return res.status(200).json(matches);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  removeMatch = async (req: Request, res: Response) => {
    try {
      const user1_id = extractUserId(req);
      const { user2_id } = req.params;

      if (!user2_id) {
        return res.status(400).json({ message: "user2_id is required" });
      }
      if (!user1_id) {
        return res.status(400).json({ message: "user_id is required" });
      }
      const result = await this.matchService.removeMatch(user1_id, user2_id);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  hasMatch = async (req: Request, res: Response) => {
    try {
      const user1_id = extractUserId(req);
      const { user2_id } = req.params;

      if (!user2_id) {
        return res.status(400).json({ message: "user2_id is required" });
      }
      if (!user1_id) {
        return res.status(400).json({ message: "user_id is required" });
      }
      const hasMatch = await this.matchService.hasMatch(user1_id, user2_id);

      return res.status(200).json({ hasMatch });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  // Endpoint to get the VAPID public key for the client
  getPublicKey = async (_req: Request, res: Response) => {
    try {
      return res.status(200).json({ publicKey: getPublicKey() });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  // Endpoint to subscribe to push notifications
  subscribe = async (req: Request, res: Response) => {
    try {
      const userId = extractUserId(req);
      const subscription = req.body;

      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({ message: "Invalid subscription object" });
      }
      if (!userId) {
        return res.status(400).json({ message: "user_id is required" });
      }
      await this.matchService.subscribe(userId, subscription);
      return res.status(201).json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };
}
