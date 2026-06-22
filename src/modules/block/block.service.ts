import Block from "./block.model";
import { Match, Profile } from "../../models";

export class BlockService {
  applyBlockEffects = async (
    initiatorUserId: string,
    targetUserId: string
  ): Promise<void> => {
    await Match.deleteOne({
      $or: [
        { user1_id: initiatorUserId, user2_id: targetUserId },
        { user1_id: targetUserId, user2_id: initiatorUserId },
      ],
    });

    await Profile.findByIdAndUpdate(initiatorUserId, {
      $addToSet: { blackList: targetUserId },
    });
  };

  blockUser = async (
    blockerUserId: string,
    blockedUserId: string
  ): Promise<{ message: string }> => {
    try {
      const existing = await Block.findOne({ blockerUserId, blockedUserId });
      if (!existing) {
        await Block.create({ blockerUserId, blockedUserId });
      }

      await this.applyBlockEffects(blockerUserId, blockedUserId);

      return { message: "User blocked successfully" };
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Error blocking user");
    }
  };

  getBlockedUsers = async (blockerUserId: string): Promise<string[]> => {
    try {
      const blocks = await Block.find({ blockerUserId }).select("blockedUserId -_id");
      return blocks.map((b) => b.blockedUserId);
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Error fetching blocked users");
    }
  };
}
