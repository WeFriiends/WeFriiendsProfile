import { Dislike } from "../../models";

export class DislikeService {
  addDislike = async (disliker_id: string, disliked_id: string) => {
    try {
      const hasDisliked = await this.hasDisliked(disliker_id, disliked_id);
      if (hasDisliked) {
        return {
          message: "User is already in dislikes",
        };
      }

      const dislikes = await Dislike.findOneAndUpdate(
        { disliker_id },
        { $addToSet: { dislikes: { disliked_id, disliked_at: new Date() } } },
        { new: true, upsert: true }
      ).exec();

      return dislikes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error adding dislike");
    }
  };

  getDislikes = async (disliker_id: string) => {
    try {
      const dislikes = await Dislike.findOne({ disliker_id }).exec();
      if (!dislikes) {
        return await Dislike.create({ disliker_id, dislikes: [] });
      }
      return dislikes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error getting dislikes");
    }
  };

  removeDislike = async (disliker_id: string, disliked_id: string) => {
    try {
      const hasDisLiked = await this.hasDisliked(disliker_id, disliked_id);
      if (!hasDisLiked) {
        throw new Error("User is not in dislikes");
      }
      const dislikes = await Dislike.findOneAndUpdate(
        { disliker_id },
        { $pull: { dislikes: { disliked_id } } },
        { new: true }
      ).exec();

      return dislikes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error removing dislike");
    }
  };

  hasDisliked = async (
    disliker_id: string,
    disliked_id: string
  ): Promise<boolean> => {
    try {
      const dislikesDoc = await Dislike.findOne({
        disliker_id,
        "dislikes.disliked_id": disliked_id,
      }).exec();

      return !!dislikesDoc;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error checking dislike");
    }
  };
}
