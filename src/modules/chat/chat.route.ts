import { Router } from "express";
import { checkJwt } from "../../middleware";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

const router = Router();

const chatService = new ChatService();
const chatController = new ChatController(chatService);

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all chats
 *       500:
 *         description: Internal server error
 */
router.get("/", checkJwt, chatController.getAllChats);

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 2
 *                 maxItems: 2
 *                 description: Array of two participant IDs
 *     responses:
 *       201:
 *         description: Chat created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", checkJwt, chatController.createChat);

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get a chat by ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Chat ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat retrieved successfully
 *       404:
 *         description: Chat not found
 */
router.get("/:id", checkJwt, chatController.getChatById);

/**
 * @swagger
 * /api/chats/{id}:
 *   put:
 *     summary: Update a chat by ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Chat ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 2
 *                 maxItems: 2
 *                 description: Array of two participant IDs
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *       404:
 *         description: Chat not found
 *       400:
 *         description: Bad request
 */
router.put("/:id", checkJwt, chatController.updateChat);

/**
 * @swagger
 * /api/chats/{id}:
 *   delete:
 *     summary: Delete a chat by ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Chat ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 *       404:
 *         description: Chat not found
 */
router.delete("/:id", checkJwt, chatController.deleteChat);

export default router;
