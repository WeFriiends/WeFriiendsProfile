import { Router } from "express";
import { upload, checkJwt } from "../../middleware";
import {
  registerProfile,
  getCurrentProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles,
  searchFriends,
  checkProfileExistsById,
} from "./profile.controller";

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
router.post("/", checkJwt, upload.any(), registerProfile);

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
 * /api/profile/check:
 *   get:
 *     summary: Сheck profile existance by ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: true - Profile found
 *       404:
 *         description: false - Profile not found
 *       400:
 *         description: Bad request
 */
router.get("/check", checkJwt, checkProfileExistsById);

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
 *               reasons:
 *                 type: array
 *                 items:
 *                   type: string
 *               blackList:
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

/**
 * @swagger
 * /api/profile/all:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *       404:
 *         description: Profiles not found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   age:
 *                     type: string
 *                   zodiacSign:
 *                     type: string
 *                   city:
 *                     type: string
 *                   distance:
 *                     type: string
 *                   likedUsers:
 *                     type: array
 *                     items:
 *                        _id: string
 *                   photos:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         src:
 *                           type: string
 *                   reasons:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/all", checkJwt, getAllProfiles);

/**
 * @swagger
 * /api/profile/search:
 *   get:
 *     summary: Search for friends
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: List of matching profiles found
 *       400:
 *         description: Bad request - invalid input parameters
 *       500:
 *         description: Error searching friends
 */
router.get("/search", checkJwt, searchFriends);

export default router;
