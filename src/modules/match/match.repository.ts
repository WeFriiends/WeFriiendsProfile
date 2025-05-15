import { Match } from "../../models";
import { adminDb } from "../../config/firebase/firebase";

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

export class RealtimeDBMatchRepository implements IMatchRepository {
  private path: string;

  constructor(
    path: string = process.env.FIREBASE_MATCHES || "match_collection"
  ) {
    this.path = path;
  }

  async create(user1_id: string, user2_id: string): Promise<any> {
    if (!adminDb) {
      throw new Error("Firebase Admin DB not initialized");
    }

    const matchData = { user1_id, user2_id };
    const newMatchRef = adminDb.ref(this.path).push();

    await newMatchRef.set(matchData);
    console.log("Saved in Firebase Realtime DB");

    return { id: newMatchRef.key, ...matchData };
  }

  async findByUserId(userId: string): Promise<any[]> {
    if (!adminDb) {
      throw new Error("Firebase Admin DB not initialized");
    }

    const matches: any[] = [];

    // Query matches where user is user1
    const user1Snapshot = await adminDb
      .ref(this.path)
      .orderByChild("user1_id")
      .equalTo(userId)
      .once("value");

    user1Snapshot.forEach((childSnapshot) => {
      matches.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
      return false; // Continue iteration
    });

    // Query matches where user is user2
    const user2Snapshot = await adminDb
      .ref(this.path)
      .orderByChild("user2_id")
      .equalTo(userId)
      .once("value");

    user2Snapshot.forEach((childSnapshot) => {
      matches.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
      return false; // Continue iteration
    });

    return matches;
  }

  async findMatch(user1_id: string, user2_id: string): Promise<any | null> {
    if (!adminDb) {
      throw new Error("Firebase Admin DB not initialized");
    }

    // First check for match in one direction
    const snapshot1 = await adminDb
      .ref(this.path)
      .orderByChild("user1_id")
      .equalTo(user1_id)
      .once("value");

    let match = null;
    snapshot1.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.user2_id === user2_id) {
        match = {
          id: childSnapshot.key,
          ...data,
        };
        return true; // Break the forEach loop
      }
      return false; // Continue iteration
    });

    if (match) return match;

    // Then check for match in the other direction
    const snapshot2 = await adminDb
      .ref(this.path)
      .orderByChild("user1_id")
      .equalTo(user2_id)
      .once("value");

    snapshot2.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.user2_id === user1_id) {
        match = {
          id: childSnapshot.key,
          ...data,
        };
        return true; // Break the forEach loop
      }
      return false; // Continue iteration
    });

    return match;
  }

  async deleteMatch(user1_id: string, user2_id: string): Promise<any> {
    if (!adminDb) {
      throw new Error("Firebase Admin DB not initialized");
    }

    const match = await this.findMatch(user1_id, user2_id);
    if (match) {
      await adminDb.ref(`${this.path}/${match.id}`).remove();
      console.log("Deleted from Firebase Realtime DB");
      return { deleted: true };
    }
    return { deleted: false };
  }

  // Method to listen for real-time updates (websocket-like functionality)
  listenForMatches(
    userId: string,
    callback: (matches: any[]) => void
  ): () => void {
    if (!adminDb) {
      throw new Error("Firebase Admin DB not initialized");
    }

    const matchesRef = adminDb.ref(this.path);

    // Set up the listener
    const listener = matchesRef.on("value", (snapshot) => {
      const matches: any[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data.user1_id === userId || data.user2_id === userId) {
            matches.push({
              id: childSnapshot.key,
              ...data,
            });
          }
          return false; // Continue iteration
        });
      }
      callback(matches);
    });

    // Return function to unsubscribe from updates
    return () => matchesRef.off("value", listener);
  }
}
