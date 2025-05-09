import { Router } from "express";
import { checkJwt } from "../../middleware";
import { LikesController } from "./likes.controller";
import { LikesService } from "./likes.service";

const router = Router();

const likesController = new LikesController(new LikesService());

/**
 * @swagger
 * /api/likes:
 *   get:
 *     summary: Get likes
 *     tags: [Likes]
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
router.get("/", checkJwt, likesController.getLikes);

/**
 * @swagger
 * /api/likes:
 *   post:
 *     summary: Add a like
 *     tags: [Likes]
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
router.post("/", checkJwt, likesController.addLike);

/**
 * @swagger
 * /api/likes:
 *   delete:
 *     summary: Remove a like
 *     tags: [Likes]
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
router.delete("/", checkJwt, likesController.removeLike);

export default router;
