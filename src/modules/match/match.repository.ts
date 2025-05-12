import { Match } from "../../models";
import firebase from "../../config/firebase/firebase";

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

export class FirestoreMatchRepository implements IMatchRepository {
  private collection: string;

  constructor(collectionName: string = process.env.FIREBASE_MATCHES!) {
    this.collection = collectionName;
  }

  async create(user1_id: string, user2_id: string): Promise<any> {
    const result = await firebase
      .collection(this.collection)
      .add({ user1_id, user2_id });
    console.log("Saved in firebase");

    return { id: result.id, user1_id, user2_id };
  }

  async findByUserId(userId: string): Promise<any[]> {
    const snapshot = await firebase
      .collection(this.collection)
      .where("user1_id", "==", userId)
      .get();

    const snapshot2 = await firebase
      .collection(this.collection)
      .where("user2_id", "==", userId)
      .get();

    const matches: any[] = [];
    snapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });

    snapshot2.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });

    return matches;
  }

  async findMatch(user1_id: string, user2_id: string): Promise<any | null> {
    const snapshot = await firebase
      .collection(this.collection)
      .where("user1_id", "==", user1_id)
      .where("user2_id", "==", user2_id)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    const snapshot2 = await firebase
      .collection(this.collection)
      .where("user1_id", "==", user2_id)
      .where("user2_id", "==", user1_id)
      .get();

    if (!snapshot2.empty) {
      const doc = snapshot2.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  }

  async deleteMatch(user1_id: string, user2_id: string): Promise<any> {
    const match = await this.findMatch(user1_id, user2_id);
    if (match) {
      await firebase.collection(this.collection).doc(match.id).delete();
      console.log("Deleted from firebase");
      return { deleted: true };
    }
    return { deleted: false };
  }
}
