import dotenv from "dotenv";
import cron from "node-cron";
import { createApp } from "./config/app";
import { connectDatabase } from "./config/database";
import { ReportService } from "./modules/report/report.service";

dotenv.config();

const startServer = async (): Promise<void> => {
  const app = createApp();
  const PORT = process.env.PORT || 8080;

  await connectDatabase();

  // Weekly admin digest — every Monday at 08:00
  const reportService = new ReportService();
  cron.schedule("0 8 * * 1", () => {
    console.log("Running weekly report digest...");
    reportService.sendWeeklyDigest().catch((err) =>
      console.error("Weekly digest error:", err)
    );
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/api-docs`);
  });
};

export default startServer;