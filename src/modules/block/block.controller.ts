import { Request, Response } from "express";
import { BlockService } from "./block.service";
import { handleServiceError } from "../../utils";

export class BlockController {
  private blockService: BlockService;

  constructor(blockService: BlockService = new BlockService()) {
    this.blockService = blockService;
  }

  /**
   * POST /api/block
   * Body: { blockerUserId: string, blockedUserId: string }
   */
  blockUser = async (req: Request, res: Response): Promise<Response> => {
    const { blockerUserId, blockedUserId } = req.body;

    if (!blockerUserId || !blockedUserId) {
      return res
        .status(400)
        .json({ error: "blockerUserId and blockedUserId are required" });
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
