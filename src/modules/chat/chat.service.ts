import Chat, { IChat } from "./chat.model";

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
