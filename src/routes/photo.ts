import { Router } from "express";
import { upload, uploadToCloudinary } from "../middleware/uploadPhoto";
import { handleUploadToCloudinary } from "../controllers/photo";
import * as photoController from "../controllers/photo";

const router = Router();

/**
 * @swagger
 * /api/photos:
 *   post:
 *     summary: Upload images to Cloudinary
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: images
 *         type: array
 *         items:
 *           type: string
 *           format: binary
 *         description: Array of images to upload
 *     responses:
 *       200:
 *         description: Successfully uploaded images
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  upload.array("images", 5),
  // @ts-ignore
  uploadToCloudinary,
  handleUploadToCloudinary
);

/**
 * @swagger
 * /api/photos:/{id}:
 *   get:
 *     summary: Get profile photos by user ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of profile photos
 *       500:
 *         description: Internal server error
 */
router.get("/:id", photoController.getPhotos);

/**
 * @swagger
 * /api/photos:
 *   post:
 *     summary: Add a new photo URL to a user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID
 *               photoUrl:
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
 *     summary: Remove a photo URL from a user's profile and from cloudinary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID
 *               photoId:
 *                 type: string
 *                 description: Photo ID to remove (photoId is taken from the URL of the photo)
 *     responses:
 *       200:
 *         description: Successfully removed photo
 *       500:
 *         description: Internal server error
 */
router.delete("/", photoController.removePhoto);

export default router;
