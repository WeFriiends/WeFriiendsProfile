import {
  IMatchRepository,
  RealtimeDBMatchRepository,
} from "./match.repository";

export class MatchService {
  private firestoreRepository: IMatchRepository;

  constructor(
    realtimeDBMatchRepository: IMatchRepository = new RealtimeDBMatchRepository()
  ) {
    this.firestoreRepository = realtimeDBMatchRepository;
  }

  addMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (hasMatch) {
        throw new Error("Users are already in match");
      }

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
