import { Router } from "express";
import { BlockController } from "./block.controller";
import { checkJwt } from "../../middleware";

const router = Router();
const blockController = new BlockController();

/**
 * @swagger
 * /api/blocks:
 *   post:
 *     summary: Block another user
 *     tags: [Block]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blockedUserId
 *             properties:
 *               blockedUserId:
 *                 type: string
 *                 description: ID of the user being blocked
 *                 example: "auth0|6a1101004d1c8bb3fbd0fe00"
 *     responses:
 *       200:
 *         description: User blocked successfully
 *       400:
 *         description: Bad Request (missing blockedUserId, self-blocking, or service error)
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         $ref: '#/components/responses/ProfileDeletedForbidden'
 *       500:
 *         description: Internal server error
*/
router.post("/", checkJwt, blockController.blockUser);

export default router;
