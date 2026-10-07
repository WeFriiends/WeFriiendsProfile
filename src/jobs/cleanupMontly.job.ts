import { LikeService } from "../modules/like/like.service";
import { DislikeService } from "../modules/dislike/dislike.service";
import { ProfileService } from "../modules/profile/profile.service";
import { MatchService } from "../modules/match/match.service";
import { BlockService } from "../modules/block/block.service";
import { ReportService } from "../modules/report/report.service";
import { ChatService } from "../modules/chat/chat.service";
import { LiveMatchRepository } from "../modules/match/match.repository";

const profileService = new ProfileService();
const likeService = new LikeService(profileService, new MatchService(), new LiveMatchRepository());
const dislikeService = new DislikeService();
const blockService = new BlockService();
const reportService = new ReportService(blockService);
const chatService = new ChatService();
const matchService = new MatchService(undefined, profileService, chatService, new LiveMatchRepository());

profileService["matchService"] = matchService;

export async function cleanupDeletedUsersMonthlyJob() {
  console.log("[Cron] Starting hard delete users job...");
  
  try {
    const pendingUsers = await profileService.getPendingDeletedProfiles();
    console.log(`[Cron] Found pending deletion profiles: ${pendingUsers.length}`);

    if (pendingUsers.length === 0) {
      console.log("[Cron] No profiles pending deletion. Cron job finished.");
      return;
    }

    for (const user of pendingUsers) {
      const userId = user._id.toString();
      let hasErrors = false;
      const errors: string[] = [];
      
      console.log(`[Cron] Starting cascading deletion for user: ${userId}`);

      try {
        const tasks = [
          { fn: () => chatService.deleteUserChatsForDeletedUser(userId), name: 'Chats from Firestore'},
          { fn: () => likeService.removeAllMyLikes(userId), name: 'Likes from Mongo'},
          { fn: () => dislikeService.removeAllMyDislikes(userId), name: 'Dislikes from Mongo'},
          { fn: () => matchService.removeAllUserMatches(userId), name: 'Matches from Mongo and Firestore'},
          { fn: () => blockService.removeAllUserBlocks(userId), name: 'Blocks from Mongo'},
          { fn: () => reportService.removeAllUserReports(userId), name: 'Reports from Mongo'},
          { fn: () => profileService.removeAllUserPhotos(userId), name: 'Photos from Mongo'},
        ];

        const results = await Promise.allSettled(tasks.map(async t => t.fn()));

        results.forEach((result, index) => {
          const { name } = tasks[index];

          if (result.status === 'fulfilled') {
            console.log(`[Cron] ${name} deleted for user: ${userId}`);
          } else {
            const e = result.reason;
            const message = e instanceof Error ? e.message : String(e);
           const errorMsg = `Error removing ${name} for ${userId}: ${message}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            hasErrors = true;
          }
        });
        
        // Mark Profile as DELETED (only if no errors)
        if (!hasErrors) {
          try {
            await profileService.endDeleteCurrentProfile(userId);
            console.log(`[Cron] Profile marked as DELETED for user: ${userId}`);
            console.log(`[Cron] Cascading deletion completed successfully for user: ${userId}`);
          } catch (e) {
            const errorMsg = `Ошибка при финальном удалении профиля для ${userId}: ${e instanceof Error ? e.message : String(e)}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            hasErrors = true;
          }
        }

        if (hasErrors) {
          console.log(`[Cron] Not all data was deleted for user ${userId}. Keeping profile for next deletion cycle.`);
          console.log(`[Cron] Errors encountered:`, errors);
        }
      } catch (error) {
        console.error(`[Cron] Critical error during cascading deletion for user ${userId}:`, error);
      }
    }
  } catch (criticalError) {
    console.error("[Cron] Critical error fetching pending profiles or running job:", criticalError);
    return
  } finally {
    console.log("[Cron] Hard delete users job finished.");
  }
}