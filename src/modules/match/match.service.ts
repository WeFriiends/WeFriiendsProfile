import moment from "moment";
import { ChatService } from "../chat/chat.service";
import { ProfileService } from "../profile/profile.service";
import { IMatchRepository, MongoMatchRepository, MatchOptions, IFirebaseRepository, FirebaseMatchRepository } from "./match.repository";

export class MatchService {
  private mongoRepository: IMatchRepository;
  private profileService: ProfileService;
  private chatService: ChatService;
  private firebaseRepository: IFirebaseRepository;

  constructor(
    mongoRepository: IMatchRepository = new MongoMatchRepository(),
    profileService: ProfileService = new ProfileService(),
    chatService: ChatService = new ChatService(),
    firebaseRepository: IFirebaseRepository = new FirebaseMatchRepository(),
  ) {
    this.mongoRepository = mongoRepository;
    this.profileService = profileService;
    this.chatService = chatService;
    this.firebaseRepository = firebaseRepository;
  }

  addMatch = async (user1_id: string, user2_id: string, options?: MatchOptions) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id, options);
      if (hasMatch) {
        throw new Error("Users are already in match");
      }

      const newMatch = await this.mongoRepository.create(user1_id, user2_id, options);

      return newMatch;
    } catch (error: unknown) {
      throw error instanceof Error
        ? error
        : new Error("Error creating new match");
    }
  };

  editMatch = async (authUserId: string, user2_id: string) => {
    try {
      const match = await this.mongoRepository.findMatch(authUserId, user2_id);
      if (!match) {
        throw new Error("Match not found");
      }

      const update: { user1_seen?: boolean; user2_seen?: boolean } = {};

      if (match.user1_id === authUserId) {
        update.user1_seen = true;
      } else if (match.user2_id === authUserId) {
        update.user2_seen = true;
      } else {
        throw new Error("Unauthorized to edit match");
      }

      const targetMatch = await this.mongoRepository.editMatch(
        authUserId,
        user2_id,
        update
      );

      return targetMatch;
    } catch (error: unknown) {
      throw error instanceof Error
        ? error
        : new Error("Error updating match");
    }
  };

  getMatches = async (user_id: string) => {
    try {
      const matches = await this.mongoRepository.findByUserId(user_id);
      if (matches.length === 0) {
        return [];
      }

      const friendSeenMap: Record<string, boolean> = {};
      matches.forEach((match) => {
        const friendId = match.user1_id === user_id ? match.user2_id : match.user1_id;
        const friendSeen = match.user1_id === user_id ? match.user1_seen : match.user2_seen;
        friendSeenMap[friendId] = friendSeen;
      })

      const friendsIds = Object.keys(friendSeenMap);

      const friends = await Promise.all(
        friendsIds.map((friendId) =>
          this.profileService.getProfileById(friendId)
        )
      );

      const modifiedFriends = await Promise.all(friends.map(async (friendDoc) => {
        if (!friendDoc) return null;

        const friendObj = friendDoc.toObject({ virtuals: true });
        const friendStrId = friendObj._id.toString();
        const hasChat = !!(await this.chatService.getChatByParticipants(user_id, friendStrId));
        if (hasChat) return null;
        return {
          id: friendStrId,
          name: friendObj.name,
          age: moment().diff(moment(friendObj.dateOfBirth), "years"),
          photo: friendObj.photos?.[0] || null,
          seen: friendSeenMap[friendStrId],
        };
      }));

      return modifiedFriends.filter((friend): friend is NonNullable<typeof friend> => friend !== null);
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
      await this.firebaseRepository.deleteMatch(user1_id, user2_id);

      return mongoResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error removing match");
    }
  };

  hasMatch = async (user1_id: string, user2_id: string, options?: MatchOptions): Promise<boolean> => {
    try {
      const mongoResult = await this.mongoRepository.findMatch(
        user1_id,
        user2_id,
        options
      );
      return !!mongoResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error checking match");
    }
  };

  removeMyMatches = async (userId: string) => {
    const matches = await this.mongoRepository.deleteAllMatchByUserId(userId);
    await this.firebaseRepository.deleteAllMatchByUserId(userId);
    return matches
  }
}
