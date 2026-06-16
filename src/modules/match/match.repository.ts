import { Match } from "../../models";
import { firebaseDb } from "../../config/firebase";
import { ClientSession } from "mongoose";

export interface IMatchRepository {
  create(user1_id: string, user2_id: string, options?: MatchOptions): Promise<any>;
  findByUserId(userId: string): Promise<any[]>;
  findMatch(user1_id: string, user2_id: string, options?: MatchOptions): Promise<any | null>;
  deleteMatch(user1_id: string, user2_id: string): Promise<any>;
  editMatch(
    user1_id: string,
    user2_id: string,
    update: Partial<{ user1_seen: boolean; user2_seen: boolean }>
  ): Promise<any | null>;
}
export interface IFirebaseRepository {
  create(user1_id: string, user2_id: string): Promise<any>;
  deleteMatch(user1_id: string, user2_id: string): Promise<any>;
}
export interface MatchOptions {
  session?: ClientSession;
}

export interface MatchOptions {
  session?: ClientSession;
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
}

export class FirebaseMatchRepository implements IFirebaseRepository {
  async create(user1_id: string, user2_id: string): Promise<any> {
    const comboId = [user1_id, user2_id].sort().join("_");
    const updates: Record<string, any> = {};

    updates[`/matches/${user1_id}/${comboId}`] = true;
    updates[`/matches/${user2_id}/${comboId}`] = true;

    await firebaseDb.ref().update(updates);
    
    return { user1_id, user2_id, comboId };
  }

  async deleteMatch(user1_id: string, user2_id: string): Promise<any> {
    const comboId = [user1_id, user2_id].sort().join("_");

    const updates: Record<string, any> = {};

    updates[`/matches/${user1_id}/${comboId}`] = null;
    updates[`/matches/${user2_id}/${comboId}`] = null;

    await firebaseDb.ref().update(updates);

    return { success: true, comboId };
  }
}