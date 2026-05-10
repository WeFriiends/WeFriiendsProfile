import { Router } from "express";
import { ReportController } from "./report.controller";

const router = Router();
const reportController = new ReportController();

/**
 * POST /api/report
 * Submit a complaint against a user
 */
router.post("/", reportController.createReport);

export default router;
