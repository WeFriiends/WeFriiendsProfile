import Block from "./block.model";
import { Match, Profile } from "../../models";
import { Chat } from "../../models";

export class BlockService {
  /**
   * POST /api/block
   * - Saves block record
   * - Deletes the match between the two users (if any)
   * - Deletes the chat between the two users (if any)
   * - Adds blockedUserId to the blocker's blackList so the blocked user
   *   is excluded from future search results
   */
  blockUser = async (
    blockerUserId: string,
    blockedUserId: string
  ): Promise<{ message: string }> => {
    try {
      // Save the block (ignore duplicate error — already blocked)
      const existing = await Block.findOne({ blockerUserId, blockedUserId });
      if (!existing) {
        await Block.create({ blockerUserId, blockedUserId });
      }

      // Remove match (both directions)
      await Match.deleteOne({
        $or: [
          { user1_id: blockerUserId, user2_id: blockedUserId },
          { user1_id: blockedUserId, user2_id: blockerUserId },
        ],
      });

      // Remove chat
      await Chat.deleteOne({
        participants: { $all: [blockerUserId, blockedUserId] },
      });

      // Add to blackList of the blocker's profile so they never appear again
      await Profile.findByIdAndUpdate(blockerUserId, {
        $addToSet: { blackList: blockedUserId },
      });

      return { message: "User blocked successfully" };
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Error blocking user");
    }
  };

  /**
   * Returns the list of user IDs blocked by the given user.
   */
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
