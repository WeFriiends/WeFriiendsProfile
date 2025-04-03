import { Router } from "express";
import { checkJwt } from "../middleware/checkJwt";
import { getFriends } from "../controllers/friends";
import { addFriend } from "../controllers/profile";

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

/**
 * @swagger
 * /api/friends:
 *   post:
 *     summary: add friend
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Receive an updated profile of friend
 *       400:
 *         description: Bad request
 *       404:
 *          description: Profile not found
 */
router.post("/", checkJwt, addFriend);

export default router;
