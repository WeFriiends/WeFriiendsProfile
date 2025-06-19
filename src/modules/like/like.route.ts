import { Router } from "express";
import { checkJwt } from "../../middleware";
import { LikeController } from "./like.controller";
import { LikeService } from "./like.service";

const router = Router();

const likeController = new LikeController(new LikeService());

/**
 * @swagger
 * /api/likes:
 *   get:
 *     summary: Get likes
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Like got successfully
 *       400:
 *         description: liked_id is required
 *       404:
 *         description: Liked Profile not found
 *       500:
 *         description: Failed to add a like
 */
router.get("/", checkJwt, likeController.getLikes);

/**
 * @swagger
 * /api/likes:
 *   post:
 *     summary: Add a like
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - liked_id
 *             properties:
 *               liked_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Like added successfully
 *       400:
 *         description: liked_id is required
 *       404:
 *         description: Liked Profile not found
 *       500:
 *         description: Failed to add a like
 */
router.post("/", checkJwt, likeController.addLike);

/**
 * @swagger
 * /api/likes:
 *   delete:
 *     summary: Remove a like
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - liked_id
 *             properties:
 *               liked_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Like removed successfully
 *       400:
 *         description: Required fields missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to remove like
 */
router.delete("/", checkJwt, likeController.removeLike);

export default router;
