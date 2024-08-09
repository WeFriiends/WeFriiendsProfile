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
 * /api/profile:
 *   post:
 *     summary: Register a new profile
 *     tags: [Profile]
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
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   street:
 *                     type: string
 *                   houseNumber:
 *                     type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *               gender:
 *                 type: string
 *               reasons:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", checkJwt, registerProfile);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/", checkJwt, getCurrentProfile);

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Update current profile
 *     tags: [Profile]
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
 *               zodiacSign:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   street:
 *                     type: string
 *                   houseNumber:
 *                     type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *               gender:
 *                 type: string
 *               reasons:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 */
router.patch("/", checkJwt, updateProfile);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete current profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete("/", checkJwt, deleteProfile);

export default router;
