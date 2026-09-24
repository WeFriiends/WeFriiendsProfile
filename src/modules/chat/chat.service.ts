import Chat, { IChat } from "./chat.model";
import { firestore, FieldValue } from "../../config/firebase";

type ChatVisibilityAction = 'hide' | 'unhide';

export interface BaseOperationResult {
  success: boolean;
  message?: string;
}
export interface HideOperationResult extends BaseOperationResult {
  updatedCount: number;
}
export interface DeleteOperationResult extends BaseOperationResult {
  deletedCount: number;
}
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

  async deleteUserChatsForDeletedUser(userId: string): Promise<DeleteOperationResult> {
    if (!userId) {
      throw new Error('UserId is required');
    }

    try {
      const snapshot = await firestore
        .collection('conversations')
        .where('participants', 'array-contains', userId)
        .select()
        .get();

      if (snapshot.empty) {
        return { success: true, deletedCount: 0, message: 'No chats found to delete' };
      }

      const CHAT_BATCH_SIZE = 5;

      for (let i = 0; i < snapshot.docs.length; i += CHAT_BATCH_SIZE) {
        const chunk = snapshot.docs.slice(i, i + CHAT_BATCH_SIZE);
        await Promise.all(
          chunk.map((chatDoc) => firestore.recursiveDelete(chatDoc.ref))
        );
      }

      return {
        success: true,
        deletedCount: snapshot.size,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete chats for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  private async toggleUserChatsVisibility(
    userId: string,
    action: ChatVisibilityAction
  ): Promise<HideOperationResult> {
    if (!userId) {
      throw new Error('UserId is required');
    }

    const isHide = action === 'hide';
    const arrayOperation = isHide ? FieldValue.arrayUnion : FieldValue.arrayRemove;
    const actionText = isHide ? 'hide' : 'unhide';
    const hiddenText = isHide ? 'hidden' : 'visible';

    try {
      const snapshot = await firestore
        .collection('conversations')
        .where('participants', 'array-contains', userId)
        .select('deletedBy')
        .get();

      if (snapshot.empty) {
        return { success: true, updatedCount: 0, message: `No chats found to ${actionText}` };
      }

      const docsToUpdate = snapshot.docs.filter((doc) => {
        const deletedBy = doc.get('deletedBy') as string[] | undefined;
        const isAlreadyDeleted = Boolean(deletedBy?.includes(userId));
        return isHide ? !isAlreadyDeleted : isAlreadyDeleted;
      });

      if (docsToUpdate.length === 0) {
        return { success: true, updatedCount: 0, message: `All chats are already ${hiddenText}`};
      }

      const BATCH_LIMIT = 500;
      const batchPromises: Promise<FirebaseFirestore.WriteResult[]>[] = [];

      for (let i = 0; i < docsToUpdate.length; i += BATCH_LIMIT) {
        const batch = firestore.batch();
        const chunk = docsToUpdate.slice(i, i + BATCH_LIMIT);

        chunk.forEach((doc) => {
          batch.update(doc.ref, {
            deletedBy: arrayOperation(userId),
          });
        });

        batchPromises.push(batch.commit());
      }

      await Promise.all(batchPromises);

      return {
        success: true,
        updatedCount: docsToUpdate.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to ${actionText} chats for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async hideUserChatsForDeletedUser(userId: string): Promise<HideOperationResult> {
    return this.toggleUserChatsVisibility(userId, 'hide');
  }

  async unhideUserChatsForDeletedUser(userId: string): Promise<HideOperationResult> {
    return this.toggleUserChatsVisibility(userId, 'unhide');
  }
  

}
