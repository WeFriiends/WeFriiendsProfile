import { Match } from "../../models";
import { firebaseDb } from "../../config/firebase";

export interface IMatchRepository {
  create(user1_id: string, user2_id: string): Promise<any>;
  findByUserId(userId: string): Promise<any[]>;
  findMatch(user1_id: string, user2_id: string): Promise<any | null>;
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

export class MongoMatchRepository implements IMatchRepository {
  async create(user1_id: string, user2_id: string): Promise<any> {
    return await Match.create({ user1_id, user2_id });
  }

  async findByUserId(userId: string): Promise<any[]> {
    return await Match.find({
      $or: [{ user1_id: userId }, { user2_id: userId }],
    }).exec();
  }

  async findMatch(user1_id: string, user2_id: string): Promise<any | null> {
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
    
    await firebaseDb.ref("matches").child(comboId).set({
      users: { [user1_id]: true, [user2_id]: true },
      type: "match",
      createdAt: new Date().toISOString()
    });
    
    return { user1_id, user2_id, comboId };
  }

  async deleteMatch(user1_id: string, user2_id: string): Promise<any> {
    const comboId = [user1_id, user2_id].sort().join("_");
    await firebaseDb.ref("matches").child(comboId).remove();
    return { success: true };
  }
}