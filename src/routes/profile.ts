import { Router } from "express";
import { checkJwt } from "../middleware/checkJwt";
import {
  registerProfile,
  getCurrentProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profile";

const router = Router();

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", checkJwt, registerProfile);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/", checkJwt, getCurrentProfile);

/**
 * @swagger
 * /api/user:
 *   put:
 *     summary: Update current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 */
router.put("/", checkJwt, updateProfile);

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Delete current user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete("/", checkJwt, deleteProfile);

export default router;
