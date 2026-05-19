import { Router } from "express";
import { ReportController } from "./report.controller";
import { checkJwt } from "../../middleware";

const router = Router();
const reportController = new ReportController();

/**
 * POST /api/report
 * Submit a complaint against a user.
 * reporterUserId is taken from the JWT.
 */
router.post("/", checkJwt, reportController.createReport);

export default router;
