import { Request, Response } from "express";
import { BlockService } from "./block.service";
import { extractUserId, handleServiceError } from "../../utils";
import { Profile, DeletionStatus } from "../../models";

export class BlockController {
  private blockService: BlockService;

  constructor(blockService: BlockService = new BlockService()) {
    this.blockService = blockService;
  }

  blockUser = async (req: Request, res: Response): Promise<Response> => {
    console.log("controller blockUser");
    const blockerUserId = extractUserId(req);
    if (!blockerUserId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const { blockedUserId } = req.body;

    if (!blockedUserId) {
      return res.status(400).json({ error: "blockedUserId is required" });
    }

    if (blockerUserId === blockedUserId) {
      return res.status(400).json({ error: "A user cannot block themselves" });
    }

    try {
      const blockedProfile = await Profile.findById(blockedUserId).exec();
      if (!blockedProfile) {
        return res.status(404).json({ message: "Blocked Profile not found" });
      }
      if(blockedProfile.deletionStatus !== DeletionStatus.ACTIVE) {
        return res.status(403).json({ message: "Access denied: This account is deleted" });
      }

      const result = await this.blockService.blockUser(blockerUserId, blockedUserId);
      return res.status(200).json(result);
    } catch (error) {
      return handleServiceError(error, "Error blocking user", res, 400);
    }
  };
}
