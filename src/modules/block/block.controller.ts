import { Request, Response } from "express";
import { BlockService } from "./block.service";
import { extractUserId, handleServiceError } from "../../utils";

export class BlockController {
  private blockService: BlockService;

  constructor(blockService: BlockService = new BlockService()) {
    this.blockService = blockService;
  }

  /**
   * POST /api/block
   * Body: { blockedUserId: string }
   * blockerUserId is taken from the JWT (extractUserId).
   */
  blockUser = async (req: Request, res: Response): Promise<Response> => {
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
      const result = await this.blockService.blockUser(blockerUserId, blockedUserId);
      return res.status(200).json(result);
    } catch (error) {
      return handleServiceError(error, "Error blocking user", res, 400);
    }
  };
}
