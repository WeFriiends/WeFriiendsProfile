import { Router } from "express";
import { MatchController } from "./match.controller";
import { checkJwt } from "../../middleware";
import { MatchService } from "./match.service";

const router = Router();

const matchController: MatchController = new MatchController(
  new MatchService()
);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get matches
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: matches got successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to add a match
 */
router.get("/", checkJwt, matchController.getMatches);

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Add a match
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user2_id
 *             properties:
 *               user2_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: match added successfully
 *       400:
 *         description: user2_id is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to add a match
 */
router.post("/", checkJwt, matchController.addMatch);

/**
 * @swagger
 * /api/matches:
 *   delete:
 *     summary: Remove a match
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user2_id
 *             properties:
 *               user2_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: match removed successfully
 *       400:
 *         description: Required fields missing
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: There is no such match
 *       500:
 *         description: Failed to remove a match
 */
router.delete("/", checkJwt, matchController.removeMatch);

export default router;
