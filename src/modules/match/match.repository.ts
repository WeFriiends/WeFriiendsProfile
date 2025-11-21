import { Match } from "../../models";

export interface IMatchRepository {
  create(user1_id: string, user2_id: string): Promise<any>;
  findByUserId(userId: string): Promise<any[]>;
  findMatch(user1_id: string, user2_id: string): Promise<any | null>;
  deleteMatch(user1_id: string, user2_id: string): Promise<any>;
  editMatch(
    user1_id: string,
    user2_id: string,
    user1_seen: boolean,
    user2_seen: boolean
  ): Promise<any | null>;
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
    user1_seen: boolean,
    user2_seen: boolean
  ): Promise<any | null> {
    return await Match.findOneAndUpdate(
      {
        $or: [
          { user1_id, user2_id },
          { user1_id: user2_id, user2_id: user1_id },
        ],
      },
      {
        user1_seen,
        user2_seen,
      },
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
