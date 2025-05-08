import { Router } from "express";
import * as chatController from "./chat.controller";

const router = Router();

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats
 *     responses:
 *       200:
 *         description: List of all chats
 *       500:
 *         description: Internal server error
 */
router.get("/", chatController.getAllChats);

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chat_id:
 *                 type: string
 *                 description: Chat ID
 *               user_id:
 *                 type: string
 *                 description: User ID
 *               friend_id:
 *                 type: string
 *                 description: Friend ID
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     message_id:
 *                       type: string
 *                     sender_id:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     message:
 *                       type: string
 *                     read_status:
 *                       type: boolean
 *                 description: Array of messages
 *     responses:
 *       200:
 *         description: Successfully created chat
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/", chatController.createChat);

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get a chat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat details
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", chatController.getChatById);

/**
 * @swagger
 * /api/chats/{id}:
 *   put:
 *     summary: Update a chat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chat_id:
 *                 type: string
 *                 description: Chat ID
 *               user_id:
 *                 type: string
 *                 description: User ID
 *               friend_id:
 *                 type: string
 *                 description: Friend ID
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     message_id:
 *                       type: string
 *                     sender_id:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     message:
 *                       type: string
 *                     read_status:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated chat
 *       404:
 *         description: Chat not found
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put("/:id", chatController.updateChat);

/**
 * @swagger
 * /api/chats/{id}:
 *   delete:
 *     summary: Delete a chat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Successfully deleted chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", chatController.deleteChat);

export default router;
