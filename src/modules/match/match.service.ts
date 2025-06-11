import { LikeService } from "../like/like.service";
import { ProfileService } from "../profile/profile.service";
import { IMatchRepository, MongoMatchRepository } from "./match.repository";

export class MatchService {
  private mongoRepository: IMatchRepository;
  private profileService: ProfileService;

  constructor(
    mongoRepository: IMatchRepository = new MongoMatchRepository(),
    profileService: ProfileService = new ProfileService(new LikeService())
  ) {
    this.mongoRepository = mongoRepository;
    this.profileService = profileService;
  }

  addMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (hasMatch) {
        throw new Error("Users are already in match");
      }

      const newMatch = await this.mongoRepository.create(user1_id, user2_id);

      return newMatch;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error creating new match");
    }
  };

  getMatches = async (user_id: string) => {
    try {
      const matches = await this.mongoRepository.findByUserId(user_id);
      if (matches.length === 0) {
        return [];
      }
      const friendsIds: string[] = matches.map((match) =>
        match.user1_id === user_id ? match.user2_id : match.user1_id
      );

      const friends = await Promise.all(
        friendsIds.map((friendId) =>
          this.profileService.getProfileById(friendId)
        )
      );

      const modifiedFriens = friends.map((friend) => {
        return {
          id: friend.id,
          name: friend.name,
          age: new Date().getFullYear() - friend.dateOfBirth.getFullYear(),
          photo: friend.photos?.[0] || null,
        };
      });

      return modifiedFriens;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error getting matches");
    }
  };

  removeMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (!hasMatch) {
        throw new Error("There is no such match");
      }

      const mongoResult = await this.mongoRepository.deleteMatch(
        user1_id,
        user2_id
      );

      return mongoResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error removing match");
    }
  };

  hasMatch = async (user1_id: string, user2_id: string): Promise<boolean> => {
    try {
      const mongoResult = await this.mongoRepository.findMatch(
        user1_id,
        user2_id
      );

      return !!mongoResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error checking match");
    }
  };
}
