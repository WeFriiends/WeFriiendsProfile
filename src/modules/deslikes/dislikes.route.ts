import { Router } from "express";
import { checkJwt } from "../../middleware";
import { DislikesController } from "./dislikes.controller";
import { DislikesService } from "./dislikes.service";

const router = Router();

const dislikesController = new DislikesController(new DislikesService());

/**
 * @swagger
 * /api/dislikes:
 *   get:
 *     summary: Get dislikes
 *     tags: [Dislikes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: dislike got successfully
 *       400:
 *         description: disliked_id is required
 *       404:
 *         description: disliked Profile not found
 *       500:
 *         description: Failed to add a dislike
 */
router.get("/", checkJwt, dislikesController.getDislikes);

/**
 * @swagger
 * /api/dislikes:
 *   post:
 *     summary: Add a dislike
 *     tags: [Dislikes]
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
 *       404:
 *         description: disliked Profile not found
 *       500:
 *         description: Failed to add a dislike
 */
router.post("/", checkJwt, dislikesController.addDislike);

/**
 * @swagger
 * /api/dislikes:
 *   delete:
 *     summary: Remove a dislike
 *     tags: [Dislikes]
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
 *       500:
 *         description: Failed to remove dislike
 */
router.delete("/", checkJwt, dislikesController.removeDislike);

export default router;
