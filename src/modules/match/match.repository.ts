import { Match } from "../../models";

export interface IMatchRepository {
  create(user1_id: string, user2_id: string): Promise<any>;
  findByUserId(userId: string): Promise<any[]>;
  findMatch(user1_id: string, user2_id: string): Promise<any | null>;
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

  async deleteMatch(user1_id: string, user2_id: string): Promise<any> {
    return await Match.deleteOne({
      $or: [
        { user1_id, user2_id },
        { user1_id: user2_id, user2_id: user1_id },
      ],
    }).exec();
  }
}
