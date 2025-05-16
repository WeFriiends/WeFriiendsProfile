import mongoose, { Document, Schema } from "mongoose";

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SubscriptionDocument extends Document {
  userId: string;
  subscription: PushSubscription;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: String, required: true, unique: true },
    subscription: {
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);

export default Subscription;