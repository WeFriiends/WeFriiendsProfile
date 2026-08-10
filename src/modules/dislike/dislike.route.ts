import { Router } from "express";
import { checkJwt, checkProfileActive } from "../../middleware";
import { DislikeController } from "./dislike.controller";
import { DislikeService } from "./dislike.service";

const router = Router();

const dislikeController = new DislikeController(new DislikeService());

/**
 * @swagger
 * /api/dislikes:
 *   get:
 *     summary: Get dislikes
 *     tags: [Dislike]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: dislike got successfully
 *       400:
 *         description: disliked_id is required
 *       403:
 *         $ref: '#/components/responses/ProfileDeletedForbidden'
 *       404:
 *         description: disliked Profile not found
 *       500:
 *         description: Failed to add a dislike
 */
router.get("/", checkJwt, checkProfileActive, dislikeController.getDislikes);

/**
 * @swagger
 * /api/dislikes:
 *   post:
 *     summary: Add a dislike
 *     tags: [Dislike]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disliked_id
 *             properties:
 *               disliked_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: dislike added successfully
 *       400:
 *         description: disliked_id is required
 *       403:
 *         $ref: '#/components/responses/ProfileDeletedForbidden'
 *       404:
 *         description: disliked Profile not found
 *       500:
 *         description: Failed to add a dislike
 */
router.post("/", checkJwt, checkProfileActive, dislikeController.addDislike);

/**
 * @swagger
 * /api/dislikes:
 *   delete:
 *     summary: Remove a dislike
 *     tags: [Dislike]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disliked_id
 *             properties:
 *               disliked_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: disLike removed successfully
 *       400:
 *         description: Required fields missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         $ref: '#/components/responses/ProfileDeletedForbidden'
 *       500:
 *         description: Failed to remove dislike
 */
router.delete("/", checkJwt, checkProfileActive, dislikeController.removeDislike);

export default router;
