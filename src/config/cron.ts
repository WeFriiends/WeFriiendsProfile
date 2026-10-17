import cron from "node-cron";
import { sendWeeklyDigestJob } from "../jobs/sendWeeklyDigest.job";
import { cleanupDeletedUsersMonthlyJob } from "../jobs/cleanupMontly.job";

function initCronJobs() {
    const timezone = process.env.TIMEZONE

    // Weekly admin digest — every Monday at 08:00
    cron.schedule("0 8 * * 1", async () => {
        try {
            await sendWeeklyDigestJob()
        } catch (error) {
            console.error("Error in cron job:", error);
        }
    }, {timezone});

    // Monthly admin digest — 1st day of every month at 09:00
    cron.schedule("0 9 1 * *", async () => {
        try {
            await cleanupDeletedUsersMonthlyJob();
        } catch (error) {
            console.error("Error in cron job:", error);
        }
    }, {timezone});
}

export default initCronJobs;