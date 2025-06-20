import { Router } from "express";
import { uploadToCloudinary } from "../../middleware";
import { upload } from "../../middleware/uploadPhoto";
import { handleUploadToCloudinary } from "./photo.controller";
import * as photoController from "./photo.controller";

const router = Router();

/**
 * @swagger
 * /api/photos/upload:
 *   post:
 *     tags: [Photo]
 *     summary: Upload images to Cloudinary
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of images to upload (max 5 files)
 *     responses:
 *       200:
 *         description: Successfully uploaded images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: No files provided or invalid file type
 *       500:
 *         description: Internal server error
 */
router.post(
  "/upload",
  upload.array("images", 5),
  // @ts-ignore
  uploadToCloudinary,
  handleUploadToCloudinary
);

/**
 * @swagger
 * /api/photos:
 *   get:
 *     tags: [Photo]
 *     summary: Get profile photos
 *     responses:
 *       200:
 *         description: List of profile photos
 *       500:
 *         description: Internal server error
 */
router.get("/", photoController.getPhotos);

/**
 * @swagger
 * /api/photos:
 *   post:
 *     tags: [Photo]
 *     summary: Add a new photo URL to a user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                photoUrl:
 *                 type: string
 *                 description: Photo URL to add
 *     responses:
 *       200:
 *         description: Successfully added photo
 *       500:
 *         description: Internal server error
 */
router.post("/", photoController.addPhoto);

/**
 * @swagger
 * /api/photos:
 *   delete:
 *     tags: [Photo]
 *     summary: Remove a photo URL from a user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photoUrl:
 *                 type: string
 *                 description: Photo URL to remove
 *     responses:
 *       200:
 *         description: Successfully removed photo
 *       500:
 *         description: Internal server error
 */
router.delete("/", photoController.removePhoto);

export default router;
