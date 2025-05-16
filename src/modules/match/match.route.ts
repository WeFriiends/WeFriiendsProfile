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

/**
 * @swagger
 * /api/matches/notifications/public-key:
 *   get:
 *     summary: Get the VAPID public key for push notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: VAPID public key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get("/notifications/public-key", matchController.getPublicKey);

/**
 * @swagger
 * /api/matches/notifications/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *               - keys
 *             properties:
 *               endpoint:
 *                 type: string
 *               expirationTime:
 *                 type: number
 *                 nullable: true
 *               keys:
 *                 type: object
 *                 required:
 *                   - p256dh
 *                   - auth
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       201:
 *         description: Subscription saved successfully
 *       400:
 *         description: Bad request
 */
router.post("/notifications/subscribe", checkJwt, matchController.subscribe);

export default router;
