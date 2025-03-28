import { Router } from "express";
import { checkJwt } from "../middleware/checkJwt";
import { getFriends } from "../controllers/friends";

const router = Router();

/**
 * @swagger
 * /api/friends:
 *   get:
 *     summary: Get a list of friends
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Receive a list of friends
 *       404:
 *          description: Profile not found
 *       500:
 *         description: Server error
 */
router.get("/", checkJwt, getFriends);

export default router;
