import { Router } from "express";
import { ReportController } from "./report.controller";
import { checkJwt, checkProfileActive } from "../../middleware";

const router = Router();
const reportController = new ReportController();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a report against another user
 *     tags: [Report]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportedUserId
 *               - reason
 *             properties:
 *               reportedUserId:
 *                 type: string
 *                 description: ID of the user being reported
 *                 example: "auth0|6a1101004d1c8bb3fbd0fe00"
 *               reason:
 *                 type: string
 *                 description: Reason for reporting the user
 *                 example: "SPAM"
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional comment explaining the report (max 500 characters)
 *                 example: "Inappropriate messages in chat"
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *       400:
 *         description: Bad Request (missing required fields, invalid reason, self-reporting, or comment too long)
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         $ref: '#/components/responses/ProfileDeletedForbidden'
 *       500:
 *         description: Internal server error
*/
router.post("/", checkJwt, checkProfileActive, reportController.createReport);

export default router;
