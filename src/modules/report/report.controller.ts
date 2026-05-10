import { Request, Response } from "express";
import { ReportService } from "./report.service";
import { handleServiceError } from "../../utils";
import { ReportReason } from "./report.model";

const VALID_REASONS: ReportReason[] = [
  "spam",
  "abuse",
  "inappropriate-photos",
  "other",
];

export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService = new ReportService()) {
    this.reportService = reportService;
  }

  /**
   * POST /api/report
   * Body: { reportedUserId, reporterUserId, reason, comment? }
   */
  createReport = async (req: Request, res: Response): Promise<Response> => {
    const { reportedUserId, reporterUserId, reason, comment } = req.body;

    if (!reportedUserId || !reporterUserId || !reason) {
      return res.status(400).json({
        error: "reportedUserId, reporterUserId and reason are required",
      });
    }

    if (!VALID_REASONS.includes(reason as ReportReason)) {
      return res.status(400).json({
        error: `reason must be one of: ${VALID_REASONS.join(", ")}`,
      });
    }

    if (reportedUserId === reporterUserId) {
      return res.status(400).json({ error: "A user cannot report themselves" });
    }

    if (comment && comment.length > 500) {
      return res
        .status(400)
        .json({ error: "comment must be 500 characters or fewer" });
    }

    try {
      const result = await this.reportService.createReport(
        reportedUserId,
        reporterUserId,
        reason as ReportReason,
        comment
      );
      return res.status(201).json(result);
    } catch (error) {
      return handleServiceError(error, "Error creating report", res, 400);
    }
  };
}
