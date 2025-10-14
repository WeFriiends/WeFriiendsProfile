import { Router } from "express";
import { upload, checkJwt } from "../../middleware";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { LikeService } from "../like/like.service";
import { MatchService } from "../match/match.service";

const router = Router();

const likeService = new LikeService(new ProfileService());
const profileService = new ProfileService(likeService);
const matchService = new MatchService(undefined, profileService);
profileService["matchService"] = matchService;

const profileController: ProfileController = new ProfileController(
  profileService,
  likeService
);

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dateOfBirth
 *               - location
 *               - gender
 *               - reasons
 *               - files
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth (YYYY-MM-DD)
 *               location:
 *                 type: string
 *                 description: JSON string containing location object with lat, lng, country, city, street (optional), houseNumber (optional)
 *               gender:
 *                 type: string
 *                 description: User's gender
 *               reasons:
 *                 type: string
 *                 description: JSON string array of reasons for joining
 *               preferences:
 *                 type: string
 *                 description: Optional JSON string containing user preferences (aboutMe, selectedLanguages, smoking, educationalLevel, children, drinking, pets, interests)
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Profile photos (at least one required)
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       401:
 *         description: Unauthorized - no token provided
 */
router.post("/", checkJwt, upload.any(), profileController.registerProfile);

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
router.get("/", checkJwt, profileController.getCurrentProfile);

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
router.get("/check", checkJwt, profileController.checkProfileExistsById);

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
router.get("/search", checkJwt, profileController.searchFriends);

/**
 * @swagger
 * /api/profile/nearest:
 *   get:
 *     summary: Get nearest profiles within user's distance preference
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of nearest profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   distance:
 *                     type: number
 *                   picture:
 *                     type: string
 *                     nullable: true
 *                   likedUsers:
 *                     type: boolean
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/nearest", checkJwt, profileController.getNearestProfiles);

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
router.get("/all", checkJwt, profileController.getAllProfiles);

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *          - name: userId
 *            in: path
 *            required: true
 *            description: The ID of the user to retrieve
 *            schema:
 *              type: string
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
router.get("/:userId", checkJwt, profileController.getProfileById);

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
 *               preferences:
 *                 type: object
 *                 properties:
 *                   aboutMe:
 *                     type: string
 *                   selectedLanguages:
 *                     type: array
 *                     items:
 *                       type: string
 *                   smoking:
 *                     type: array
 *                     items:
 *                       type: string
 *                   educationalLevel:
 *                     type: array
 *                     items:
 *                       type: string
 *                   children:
 *                     type: array
 *                     items:
 *                       type: string
 *                   drinking:
 *                     type: array
 *                     items:
 *                       type: string
 *                   pets:
 *                     type: array
 *                     items:
 *                       type: string
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
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
 *               friendsAgeMin:
 *                 type: number
 *               friendsAgeMax:
 *                 type: number
 *               friendsDistance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request
 */
router.patch("/", checkJwt, profileController.updateProfile);

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
router.delete("/", checkJwt, profileController.deleteProfile);

export default router;
