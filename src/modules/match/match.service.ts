import { IMatchRepository, MongoMatchRepository } from "./match.repository";
import { ISubscriptionRepository, MongoSubscriptionRepository } from "../subscription/subscription.repository";
import webPush from "../../config/webpush";
import { Profile } from "../../models";

export class MatchService {
  private mongoRepository: IMatchRepository;
  private subscriptionRepository: ISubscriptionRepository;

  constructor(
    mongoRepository: IMatchRepository = new MongoMatchRepository(),
    subscriptionRepository: ISubscriptionRepository = new MongoSubscriptionRepository()
  ) {
    this.mongoRepository = mongoRepository;
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
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error creating new match");
    }
  };

  getMatches = async (user_id: string) => {
    try {
      const matches = await this.mongoRepository.findByUserId(user_id);

      return matches;
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
      const subscriptionData = await this.subscriptionRepository.findSubscription(recipientId);
      if (!subscriptionData) return; // User hasn't subscribed to notifications
      
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