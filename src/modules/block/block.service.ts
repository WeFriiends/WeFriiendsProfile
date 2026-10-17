import Block from "./block.model";
import { Match } from "../../models";

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

    await Block.updateOne(
      { blockerUserId: initiatorUserId, blockedUserId: targetUserId },
      {
        $setOnInsert: {
          blockerUserId: initiatorUserId,
          blockedUserId: targetUserId,
        },
      },
      { upsert: true }
    );
  };

  blockUser = async (
    blockerUserId: string,
    blockedUserId: string
  ): Promise<{ message: string }> => {
    try {
      await this.applyBlockEffects(blockerUserId, blockedUserId);
      return { message: "User blocked successfully" };
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Error blocking user");
    }
  };

  getBlockedUsers = async (userId: string): Promise<string[]> => {
    console.log("controller getBlockedUsers");
    try {
      const blocks = await Block.find({
        $or: [{ blockerUserId: userId }, { blockedUserId: userId }],
      }).select("blockerUserId blockedUserId -_id");

      const ids = blocks.map((b) =>
        b.blockerUserId === userId ? b.blockedUserId : b.blockerUserId
      );

      return Array.from(new Set(ids));
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Error fetching blocked users");
    }
  };

  removeAllUserBlocks = async (userId: string): Promise<void> => {
    try {
      await Block.deleteMany({
        $or: [
          { blockerUserId: userId },
          { blockedUserId: userId }
        ]
      }).exec();
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Error removing all user blocks");
    }
  };
}
