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

export async function hardDeleteUsersJob() {
  console.log("[Cron] Starting hard delete users job...");
  
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
      // MongoDB Likes
      try {
        await likeService.removeAllMyLikes(userId);
        console.log(`[Cron] Likes deleted for user: ${userId}`);
      } catch (e) {
        const errorMsg = `Ошибка при удалении лайков для ${userId}: ${e instanceof Error ? e.message : String(e)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        hasErrors = true;
      }

      // MongoDB Dislikes
      try {
        await dislikeService.removeAllMyDislikes(userId);
        console.log(`[Cron] Dislikes deleted for user: ${userId}`);
      } catch (e) {
        const errorMsg = `Ошибка при удалении дизлайков для ${userId}: ${e instanceof Error ? e.message : String(e)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        hasErrors = true;
      }

      // MongoDB and Firebase Matches
      try {
        await matchService.removeAllUserMatches(userId);
        console.log(`[Cron] Matches deleted for user: ${userId}`);
      } catch (e) {
        const errorMsg = `Ошибка при удалении матчей для ${userId}: ${e instanceof Error ? e.message : String(e)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        hasErrors = true;
      }

      // MongoDB Blocks
      try {
        await blockService.removeAllUserBlocks(userId);
        console.log(`[Cron] Blocks deleted for user: ${userId}`);
      } catch (e) {
        const errorMsg = `Ошибка при удалении блокировок для ${userId}: ${e instanceof Error ? e.message : String(e)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        hasErrors = true;
      }

      // MongoDB Reports
      try {
        await reportService.removeAllUserReports(userId);
        console.log(`[Cron] Reports deleted for user: ${userId}`);
      } catch (e) {
        const errorMsg = `Ошибка при удалении репортов для ${userId}: ${e instanceof Error ? e.message : String(e)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        hasErrors = true;
      }

      // Delete Cloudinary(mongo array and tag) and Mongo Photos 
      try {
        await profileService.removeAllUserPhotos(userId);
        console.log(`[Cron] Photos deleted from Cloudinary for user: ${userId}`);
      } catch (e) {
        const errorMsg = `Ошибка при удалении фото для ${userId}: ${e instanceof Error ? e.message : String(e)}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        hasErrors = true;
      }

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
        console.log(`[Cron] ⚠ Not all data was deleted for user ${userId}. Keeping profile for next deletion cycle.`);
        console.log(`[Cron] Errors encountered:`, errors);
      }
    } catch (error) {
      console.error(`[Cron] Critical error during cascading deletion for user ${userId}:`, error);
    }
  }

  console.log("[Cron] Hard delete users job finished.");
}