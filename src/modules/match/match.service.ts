import { ChatService } from "../chat/chat.service";
import { ProfileService } from "../profile/profile.service";
import { IMatchRepository, IFirebaseRepository, MongoMatchRepository, FirebaseMatchRepository } from "./match.repository";
export class MatchService {
  private profileService: ProfileService;
  private mongoRepository: IMatchRepository;
  private firebaseRepository: IFirebaseRepository;
  private chatService: ChatService;

  constructor(
      profileService: ProfileService = new ProfileService(),
      mongoRepository: IMatchRepository = new MongoMatchRepository(),
      firebaseRepository: IFirebaseRepository = new FirebaseMatchRepository(),
      chatService: ChatService = new ChatService()
  ){
    this.profileService = profileService;
    this.mongoRepository = mongoRepository;
    this.firebaseRepository = firebaseRepository;
    this.chatService = chatService;
  }

  addMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (hasMatch) {
        throw new Error("Users are already in match");
      }
      
      await this.firebaseRepository.create(user1_id, user2_id);
      const newMatch = await this.mongoRepository.create(user1_id, user2_id);

      return newMatch;
    } catch (error: unknown) {
      throw error instanceof Error
        ? error
        : new Error("Error creating new match");
    }
  };

  editMatch = async (user1_id: string, user2_id: string, seen: boolean) => {
    try {
      const match = await this.mongoRepository.findMatch(user1_id, user2_id);
      if (!match) {
        throw new Error("Match not found");
      }

      const update: { user1_seen?: boolean; user2_seen?: boolean } = {};

      if (match.user1_id === user1_id) {
        update.user1_seen = seen;
      } else if (match.user2_id === user1_id) {
        update.user2_seen = seen;
      } else {
        throw new Error("Unauthorized to edit match");
      }

      const targetMatch = await this.mongoRepository.editMatch(
        user1_id,
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
      const friendsIds: string[] = matches.map((match) =>
        match.user1_id === user_id ? match.user2_id : match.user1_id
      );

      const friends = await Promise.all(
        friendsIds.map((friendId) =>
          this.profileService.getProfileById(friendId)
        )
      );

      const friendsWithChats = await Promise.all(
        friends.map(async (friend) => ({
          friend,
          hasChat: !!(await this.chatService.getChatByParticipants(
            user_id,
            friend.id
          )),
        }))
      );

      const modifiedFriends = friendsWithChats
        .filter(({ hasChat }) => !hasChat)
        .map(({ friend }) => ({
          id: friend.id,
          name: friend.name,
          // amazonq-ignore-next-line
          age: new Date().getFullYear() - friend.dateOfBirth.getFullYear(),
          photo: friend.photos?.[0] || null,
        }));

      return modifiedFriends;
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

      await this.firebaseRepository.deleteMatch(user1_id, user2_id);
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
