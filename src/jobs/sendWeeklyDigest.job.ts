
import { ReportService } from "../modules/report/report.service";
const reportService = new ReportService();

export async function sendWeeklyDigestJob() {
    console.log("[Cron] Running weekly report digest...");
    reportService.sendWeeklyDigest().catch((err) =>
      console.error("[Cron] Weekly digest error:", err)
    );
}