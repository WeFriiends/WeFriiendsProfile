import { Like } from "../../models";
import { haversineDistance } from "../../utils";
import { ProfileService } from "../profile/profile.service";

export class LikeService {
  private profileService: ProfileService;

  constructor(profileService: ProfileService) {
    this.profileService = profileService;
  }

  addLike = async (liker_id: string, liked_id: string) => {
    try {
      const hasLiked = await this.hasLiked(liker_id, liked_id);
      if (hasLiked) {
        throw new Error("User is already in likes");
      }

      const likes = await Like.findOneAndUpdate(
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
      const likes = await Like.findOne({ liker_id }).exec();
      if (!likes) {
        return await Like.create({ liker_id, likes: [] });
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
      const likes = await Like.findOneAndUpdate(
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

  getLikesOnMe = async (liker_id: string) => {
    try {
      const liker = await this.profileService.getProfileById(liker_id);
      const likedMe = await Like.find({ "likes.liked_id": liker_id }).exec();
      const likedMeIds = likedMe.map((like) => like.liker_id);
      const likedMeUsers = await Promise.all(
        likedMeIds.map((id) => {
          return this.profileService.getProfileById(id);
        })
      );
      const likedMeResult = likedMeUsers.map((user) => ({
        id: user._id,
        name: user.name,
        distance: haversineDistance(
          user.location.lat,
          user.location.lng,
          liker.location.lat,
          liker.location.lng
        ),
        picture: user.photos?.[0] || null,
      }));
      return likedMeResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error getting likes on me");
    }
  };

  hasLiked = async (liker_id: string, liked_id: string): Promise<boolean> => {
    try {
      const likesDoc = await Like.findOne({
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
