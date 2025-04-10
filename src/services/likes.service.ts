import Likes from "../models/likes.model";

export class LikesService {
  addLike = async (liker_id: string, liked_id: string) => {
    try {
      const hasLiked = await this.hasLiked(liker_id, liked_id);
      if (hasLiked) {
        throw new Error("User is already in likes");
      }

      const likes = await Likes.findOneAndUpdate(
        { liker_id },
        { $addToSet: { likes: { liked_id, liked_at: new Date() } } },
        { new: true, upsert: true }
      ).exec();

      return likes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error adding like");
    }
  };

  getLikes = async (liker_id: string) => {
    try {
      const likes = await Likes.findOne({ liker_id }).exec();
      if (!likes) {
        return await Likes.create({ liker_id, likes: [] });
      }
      return likes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error getting likes");
    }
  };

  removeLike = async (liker_id: string, liked_id: string) => {
    try {
      const hasLiked = await this.hasLiked(liker_id, liked_id);
      if (!hasLiked) {
        throw new Error("User is not in likes");
      }
      const likes = await Likes.findOneAndUpdate(
        { liker_id },
        { $pull: { likes: { liked_id } } },
        { new: true }
      ).exec();

      return likes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error removing like");
    }
  };

  hasLiked = async (liker_id: string, liked_id: string): Promise<boolean> => {
    try {
      const likesDoc = await Likes.findOne({
        liker_id,
        "likes.liked_id": liked_id,
      }).exec();

      return !!likesDoc;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error checking like");
    }
  };
}
