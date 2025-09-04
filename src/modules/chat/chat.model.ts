import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChat extends Document {
  participants: [string, string];
}

const chatSchema = new Schema<IChat>(
  {
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: function (value: string[]) {
          return Array.isArray(value) && value.length === 2;
        },
        message: "participants must be an array of exactly two user ids",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure participant pairs are stored in a consistent order (unordered pair)
chatSchema.pre("validate", function (next) {
  if (Array.isArray(this.participants) && this.participants.length === 2) {
    this.participants.sort();
  }
  next();
});

// Unique per unordered pair of participants
chatSchema.index({ "participants.0": 1, "participants.1": 1 }, { unique: true });

const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
