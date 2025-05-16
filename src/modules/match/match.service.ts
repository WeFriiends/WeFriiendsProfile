import { ChatService } from "../chat/chat.service";
import { LikeService } from "../like/like.service";
import { ProfileService } from "../profile/profile.service";
import { IMatchRepository, MongoMatchRepository } from "./match.repository";
import { ISubscriptionRepository, MongoSubscriptionRepository } from "./subscription.repository";
import webPush from "../../config/webpush";
import { Profile } from "../../models";

export class MatchService {
  private mongoRepository: IMatchRepository;
  private profileService: ProfileService;
  private chatService: ChatService;
  private subscriptionRepository: ISubscriptionRepository;
  constructor(
    mongoRepository: IMatchRepository = new MongoMatchRepository(),
    profileService: ProfileService = new ProfileService(new LikeService()),
    chatService: ChatService = new ChatService(),
    subscriptionRepository: ISubscriptionRepository = new MongoSubscriptionRepository()
  ) {
    this.mongoRepository = mongoRepository;
    this.profileService = profileService;
    this.chatService = chatService;
    this.subscriptionRepository = subscriptionRepository;
  }

  addMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (hasMatch) {
        throw new Error("Users are already in match");
      }

      const newMatch = await this.mongoRepository.create(user1_id, user2_id);
      
      // Send push notifications to both users
      await this.sendMatchNotification(user1_id, user2_id);
      await this.sendMatchNotification(user2_id, user1_id);

      return newMatch;
    } catch (error: unknown) {
      throw error instanceof Error
        ? error
        : new Error("Error creating new match");
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

  subscribe = async (userId: string, subscription: any) => {
    try {
      return await this.subscriptionRepository.saveSubscription(userId, subscription);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error saving subscription");
    }
  };

  private sendMatchNotification = async (recipientId: string, matchedUserId: string) => {
    try {
      // Find the subscription for the recipient
      const subscriptionData = await this.subscriptionRepository.findSubscription(recipientId);
      if (!subscriptionData) return; // User hasn't subscribed to notifications
      
      // Get the matched user's profile to include in notification
      const matchedUserProfile = await Profile.findOne({ _id: matchedUserId }).exec();
      if (!matchedUserProfile) return;
      
      const payload = JSON.stringify({
        title: 'New Match!',
        body: `You matched with ${matchedUserProfile.name}!`,
        icon: matchedUserProfile.photos && matchedUserProfile.photos.length > 0 
          ? matchedUserProfile.photos[0] 
          : '/default-avatar.png',
        data: {
          matchId: matchedUserId,
          url: `/matches/${matchedUserId}`
        }
      });

      await webPush.sendNotification(subscriptionData.subscription, payload);
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Don't throw here to prevent match creation from failing if notification fails
    }
  };
}