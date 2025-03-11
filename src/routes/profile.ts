import { Router } from "express";
import { upload } from "../middleware/upload";
import { checkJwt } from "../middleware/checkJwt";
import {
  registerProfile,
  getCurrentProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles,
} from "../controllers/profile";
import { getAllUsers } from "../controllers/user";

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
//router.post("/", checkJwt, registerProfile);
router.post("/", upload.any(), registerProfile);

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
//router.get("/",getCurrentProfile);

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
router.get("/all", checkJwt, getAllProfiles);
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

export default router;
