import {
  IMatchRepository,
  RealtimeDBMatchRepository,
} from "./match.repository";

export class MatchService {
  private matchRepo;

  constructor(matchRepo = new RealtimeDBMatchRepository()) {
    this.matchRepo = matchRepo;
  }

  addMatch = async (user1_id: string, user2_id: string) => {
    try {
      const hasMatch = await this.hasMatch(user1_id, user2_id);
      if (hasMatch) {
        throw new Error("Users are already in match");
      }

      const newMatch = await this.matchRepo.create(user1_id, user2_id);

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
      const matches = await this.matchRepo.findByUserId(user_id);

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

      const firestoreResult = await this.matchRepo.deleteMatch(
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
      const firestoreResult = await this.matchRepo.findMatch(
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

  // Method to set up real-time updates for a user's matches
  setupMatchesListener(
    userId: string,
    onUpdate: (matches: any[]) => void
  ): () => void {
    return this.matchRepo.listenForMatches(userId, onUpdate);
  }

  // Method to listen for a specific match
  setupMatchListener(
    matchId: string,
    onUpdate: (match: any | null) => void
  ): () => void {
    return this.matchRepo.listenForMatchUpdates(matchId, onUpdate);
  }

  // Method to listen for new matches only
  setupNewMatchesListener(
    userId: string,
    onNewMatch: (match: any) => void
  ): () => void {
    return this.matchRepo.listenForNewMatches(userId, onNewMatch);
  }
}
