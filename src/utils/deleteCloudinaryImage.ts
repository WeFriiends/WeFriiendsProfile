const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default async function deleteCloudinaryImage(photoId: string) {
  if (!photoId) {
    throw new Error("Photo ID is required");
  }

  try {
    const result = await cloudinary.uploader.destroy(photoId, {
      invalidate: true
    });

    if (result.result === "ok") {
      console.log("Image deleted successfully:", result);
      return result;
    } else {
      throw new Error(`Failed to delete image: ${result.result}`);
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
}
