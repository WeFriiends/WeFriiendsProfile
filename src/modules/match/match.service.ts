import {
  IMatchRepository,
  RealtimeDBMatchRepository,
} from "./match.repository";

export class MatchService {
  // private mongoRepository: IMatchRepository;
  private firestoreRepository: IMatchRepository;

  constructor(
    // mongoRepository: IMatchRepository = new MongoMatchRepository(),
    realtimeDBMatchRepository: IMatchRepository = new RealtimeDBMatchRepository()
  ) {
    // this.mongoRepository = mongoRepository;
    this.firestoreRepository = realtimeDBMatchRepository;
  }

  addMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (hasMatch) {
        throw new Error("Users are already in match");
      }

      // Store in MongoDB
      // const newMatch = await this.mongoRepository.create(user1_id, user2_id);

      // Store in Firestore
      const newMatch = await this.firestoreRepository.create(
        user1_id,
        user2_id
      );

      return newMatch;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error creating new match");
    }
  };

  getMatches = async (user_id: string) => {
    try {
      // Get matches from MongoDB
      // const matches = await this.mongoRepository.findByUserId(user_id);

      // Get matches from Firestore
      const matches = await this.firestoreRepository.findByUserId(user_id);

      return matches;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error getting matches");
    }
  };

  removeMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (!hasMatch) {
        throw new Error("There is no such match");
      }

      // Remove from MongoDB
      // const mongoResult = await this.mongoRepository.deleteMatch(user1_id, user2_id);

      // Remove from Firestore
      const firestoreResult = await this.firestoreRepository.deleteMatch(
        user1_id,
        user2_id
      );

      return firestoreResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error removing match");
    }
  };

  hasMatch = async (user1_id: string, user2_id: string): Promise<boolean> => {
    try {
      // Check in MongoDB
      // const mongoResult = await this.mongoRepository.findMatch(user1_id, user2_id);

      // Check in Firestore
      const firestoreResult = await this.firestoreRepository.findMatch(
        user1_id,
        user2_id
      );

      return !!firestoreResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error checking match");
    }
  };
}
