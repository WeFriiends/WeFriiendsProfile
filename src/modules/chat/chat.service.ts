import Chat, { IChat } from "./chat.model";
import { firestore } from "../../config/firebase";

export class ChatService {
  async getAllChats(): Promise<IChat[]> {
    return await Chat.find();
  }

  async createChat(userId: string, friendId: string): Promise<IChat> {
    const chat = {
      participants: [userId, friendId],
    };
    const newChat = new Chat(chat);
    return await newChat.save();
  }

  async getChatByParticipants(
    userId: string,
    friendId: string
  ): Promise<boolean> {
    try {
      const conversationId = [userId, friendId].sort().join("_");
      const doc = await firestore
        .collection("conversations")
        .doc(conversationId)
        .get();
      return doc.exists;
    } catch {
      return false;
    }
  }

  async getChatById(id: string): Promise<IChat | null> {
    return await Chat.findById(id);
  }

  async updateChat(
    id: string,
    updateData: Partial<IChat>
  ): Promise<IChat | null> {
    return await Chat.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteChat(id: string): Promise<IChat | null> {
    return await Chat.findByIdAndDelete(id);
  }
}
