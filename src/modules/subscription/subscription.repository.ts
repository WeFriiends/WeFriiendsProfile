import { PushSubscription, Subscription } from "../../models";

export interface ISubscriptionRepository {
  saveSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<any>;
  findSubscription(userId: string): Promise<any | null>;
  deleteSubscription(userId: string): Promise<any>;
}

export class MongoSubscriptionRepository implements ISubscriptionRepository {
  async saveSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<any> {
    return await Subscription.findOneAndUpdate(
      { userId },
      { userId, subscription },
      { upsert: true, new: true }
    );
  }

  async findSubscription(userId: string): Promise<any | null> {
    return await Subscription.findOne({ userId }).exec();
  }

  async deleteSubscription(userId: string): Promise<any> {
    return await Subscription.deleteOne({ userId }).exec();
  }
}
