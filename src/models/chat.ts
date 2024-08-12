import mongoose, { Schema, Document, Model } from "mongoose";

interface IMessage {
  message_id: string;
  sender_id: string;
  timestamp: Date;
  message: string;
  read_status: boolean;
}

export interface IChat extends Document {
  chat_id: string;
  user_id: string;
  friend_id: string;
  messages: IMessage[];
}

const messageSchema = new Schema<IMessage>({
  message_id: { type: String, required: true },
  sender_id: { type: String, required: true },
  timestamp: { type: Date, required: true },
  message: { type: String, required: true },
  read_status: { type: Boolean, required: true }
});

const chatSchema = new Schema<IChat>({
  chat_id: { type: String, required: true },
  user_id: { type: String, required: true },
  friend_id: { type: String, required: true },
  messages: { type: [messageSchema], required: true }
});

const Chat: Model<IChat> = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
