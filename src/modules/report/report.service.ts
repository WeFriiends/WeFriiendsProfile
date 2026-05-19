import Report, { ReportReason } from "./report.model";
import { Profile } from "../../models";
import {
  sendReportThresholdAlert,
  sendWeeklyReportDigest,
  ReportSummaryRow,
} from "../../utils/email.service";

const REPORT_THRESHOLD = 5;

export class ReportService {
  /**
   * POST /api/report
   * Saves a complaint, increments the reported user's counter,
   * and fires an alert email when the threshold is reached.
   */
  createReport = async (
    reportedUserId: string,
    reporterUserId: string,
    reason: ReportReason,
    comment?: string
  ): Promise<{ message: string; reportCount: number }> => {
    try {
      // Persist the report
      await Report.create({ reportedUserId, reporterUserId, reason, comment });

      // Atomically increment the counter and get the new value
      const updatedProfile = await Profile.findByIdAndUpdate(
        reportedUserId,
        { $inc: { reportCount: 1 } },
        { new: true, select: "reportCount" }
      );

      const reportCount = updatedProfile?.reportCount ?? 0;

      // Send alert email exactly when the threshold is first crossed
      if (reportCount >= REPORT_THRESHOLD && reportCount % REPORT_THRESHOLD === 0) {
        sendReportThresholdAlert(reportedUserId, reportCount).catch((err) =>
          console.error("Failed to send threshold alert email:", err)
        );
      }

      return { message: "Report submitted successfully", reportCount };
    } catch (error: unknown) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Error creating report");
    }
  };

  /**
   * Collects all reports from the past 7 days and emails a digest to the admin.
   * Called by the weekly cron job.
   */
  sendWeeklyDigest = async (): Promise<void> => {
    try {
      const since = new Date();
      since.setDate(since.getDate() - 7);

      const reports = await Report.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .lean();

      const rows: ReportSummaryRow[] = reports.map((r) => ({
        reportedUserId: r.reportedUserId,
        reporterUserId: r.reporterUserId,
        reason: r.reason,
        comment: r.comment,
        createdAt: r.createdAt,
      }));

      await sendWeeklyReportDigest(rows);
    } catch (error: unknown) {
      console.error("Error sending weekly digest:", error);
    }
  };
}
