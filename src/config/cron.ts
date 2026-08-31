import cron from "node-cron";
import { hardDeleteUsersJob } from "../jobs/cleanup-db.job";

function initCronJobs() {
    cron.schedule("0 9 * * 1", () => {
        try {
            hardDeleteUsersJob()
        } catch (error) {
            console.error("Error in cron job:", error);
        }
    });
}

export default initCronJobs;