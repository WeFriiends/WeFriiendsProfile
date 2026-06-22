import Report, { ReportReason } from "./report.model";
import { Profile } from "../../models";
import { BlockService } from "../block/block.service";
import {
  sendReportThresholdAlert,
  sendWeeklyReportDigest,
  ReportSummaryRow,
} from "../../utils/email.service";

const REPORT_THRESHOLD = 5;

export class ReportService {
  private blockService: BlockService;

  constructor(blockService: BlockService = new BlockService()) {
    this.blockService = blockService;
  }

  createReport = async (
    reportedUserId: string,
    reporterUserId: string,
    reason: ReportReason,
    comment?: string
  ): Promise<{ message: string; reportCount: number }> => {
    try {
      await Report.create({ reportedUserId, reporterUserId, reason, comment });

      await this.blockService.applyBlockEffects(reporterUserId, reportedUserId);

      const updatedProfile = await Profile.findByIdAndUpdate(
        reportedUserId,
        { $inc: { reportCount: 1 } },
        { new: true, select: "reportCount" }
      );

      const reportCount = updatedProfile?.reportCount ?? 0;

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
