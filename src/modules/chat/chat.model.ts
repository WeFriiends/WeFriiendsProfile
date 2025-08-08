import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChat extends Document {
  participants: [string, string];
}

const chatSchema = new Schema<IChat>(
  {
    participants: { type: [String, String], required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
