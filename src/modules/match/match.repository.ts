import { Match } from "../../models";
import { ClientSession } from "mongoose";
import { firestore, FieldValue } from "../../config/firebase";

export interface IMatchRepository {
  create(user1_id: string, user2_id: string, options?: MatchOptions): Promise<any>;
  findByUserId(userId: string): Promise<any[]>;
  findMatch(user1_id: string, user2_id: string, options?: MatchOptions): Promise<any | null>;
  deleteMatch(user1_id: string, user2_id: string): Promise<any>;
  deleteAllMatchByUserId(userId: string): Promise<any>;
  editMatch(
    user1_id: string,
    user2_id: string,
    update: Partial<{ user1_seen: boolean; user2_seen: boolean }>
  ): Promise<any | null>;
}
export interface ILiveMatchRepository {
  create(user1_id: string, user2_id: string): Promise<any>;
  deleteMatch(user1_id: string, user2_id: string): Promise<any>;
  deleteMatchesForDeletedUser(userId: string): Promise<any>;
  hideMatchesForDeletedUser(userId: string): Promise<any>;
}
export interface MatchOptions {
  session?: ClientSession;
}

export interface MatchOptions {
  session?: ClientSession;
}
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
export class MongoMatchRepository implements IMatchRepository {
  async create(user1_id: string, user2_id: string, options?: MatchOptions): Promise<any> {
    return await Match.create([{ user1_id, user2_id }], { session: options?.session });
  }

  async findByUserId(userId: string): Promise<any[]> {
    return await Match.find({
      $or: [{ user1_id: userId }, { user2_id: userId }],
    }).exec();
  }

  async findMatch(user1_id: string, user2_id: string, options?: MatchOptions): Promise<any | null> {
    return await Match.findOne({
      $or: [
        { user1_id, user2_id },
        { user1_id: user2_id, user2_id: user1_id },
      ],
    }).exec();
  }

  async editMatch(
    user1_id: string,
    user2_id: string,
    update: Partial<{ user1_seen: boolean; user2_seen: boolean }>
  ): Promise<any | null> {
    return await Match.findOneAndUpdate(
      {
        $or: [
          { user1_id, user2_id },
          { user1_id: user2_id, user2_id: user1_id },
        ],
      },
      update,
      { new: true }
    );
  }

  async deleteMatch(user1_id: string, user2_id: string): Promise<any> {
    return await Match.deleteOne({
      $or: [
        { user1_id, user2_id },
        { user1_id: user2_id, user2_id: user1_id },
      ],
    }).exec();
  }

  async deleteAllMatchByUserId(userId: string): Promise<any> {
    return await Match.deleteMany({
      $or: [{ user1_id: userId }, { user2_id: userId }],
    }).exec();
  }
}

export class LiveMatchRepository implements ILiveMatchRepository {
  async create(user1_id: string, user2_id: string): Promise<any> {
    const comboId = [user1_id, user2_id].sort().join("_");
    const matchRef = firestore.collection('matches').doc(comboId);

    await matchRef.set(
      {
        users: [user1_id, user2_id],
        deletedBy: [],
      },
      { merge: true }
    );

    return { user1_id, user2_id, comboId };
  }

  async deleteMatch(user1_id: string, user2_id: string): Promise<any> {
    const comboId = [user1_id, user2_id].sort().join("_");

    await firestore.collection('matches').doc(comboId).delete();

    return { success: true, comboId };
  }

  async deleteMatchesForDeletedUser(userId: string): Promise<DeleteOperationResult> {
    if (!userId) {
      throw new Error('UserId is required');
    }
    
    try {
      const snapshot = await firestore
        .collection('matches')
        .where('users', 'array-contains', userId)
        .select()
        .get();

      if (snapshot.empty) {
        return { success: true, deletedCount: 0, message: 'No matches found to delete' };
      }
      const BATCH_LIMIT = 500;
      const batchPromises: Promise<FirebaseFirestore.WriteResult[]>[] = [];

      for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
        const batch = firestore.batch();
        const chunk = snapshot.docs.slice(i, i + BATCH_LIMIT);

        chunk.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        batchPromises.push(batch.commit());
      }

      await Promise.all(batchPromises);
      
      return {
        success: true,
        deletedCount: snapshot.size,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete matches for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async hideMatchesForDeletedUser(userId: string): Promise<HideOperationResult>{
    if (!userId) {
      throw new Error('UserId is required');
    }

    try{
      const snapshot = await firestore
        .collection('matches')
        .where('users', 'array-contains', userId)
        .select('deletedBy')
        .get();

      if (snapshot.empty) {
        return { success: true, updatedCount: 0, message: 'No matches found to hide' };
      }

      const docsToUpdate = snapshot.docs.filter((doc) => {
        const deletedBy = doc.get('deletedBy') as string[] | undefined;
        return !deletedBy || !deletedBy.includes(userId);
      });

      if (docsToUpdate.length === 0) {
        return { success: true, updatedCount: 0, message: 'All matches are already hidden' };
      }
      
      const BATCH_LIMIT = 500;
      const batchPromises: Promise<FirebaseFirestore.WriteResult[]>[] = [];
      const docs = snapshot.docs;

      for (let i = 0; i < docsToUpdate.length; i += BATCH_LIMIT) {
        const batch = firestore.batch();
        const chunk = docs.slice(i, i + BATCH_LIMIT);

        chunk.forEach((doc) => {
          batch.update(doc.ref, {
            deletedBy: FieldValue.arrayUnion(userId),
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
        `Failed to hide matches for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}