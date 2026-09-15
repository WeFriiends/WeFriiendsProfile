import cron from "node-cron";
import { hardDeleteUsersJob } from "../jobs/cleanup-db.job";

function initCronJobs() {
    // cron.schedule("0 9 * * 1", async () => {
    cron.schedule("1 * * * * *", async () => {
        try {
            await hardDeleteUsersJob();
        } catch (error) {
            console.error("Error in cron job:", error);
        }
    });
}

export default initCronJobs;