import cloudinary from "../config/cloudinary";

export async function deleteCloudinaryImage(photoId: string) {
  if (!photoId) {
    throw new Error("Photo ID is required");
  }

  try {
    const result = await cloudinary.uploader.destroy(photoId, {
      invalidate: true,
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

export async function deleteAllMyCloudinaryImage(userId: string) {
  try {
    return await cloudinary.api.delete_resources_by_tag(userId, {
      invalidate: true
    });
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
    throw error;
  }
}

export async function getAllMyCloudinaryImage(userId: string): Promise<string[]> {
  try{
    const result = await cloudinary.search
      .expression(`tags="${userId}"`)
      .max_results(500)
      .execute();
      
    if(result.total_count === 0){
      return [];
    }

    return result.resources.map((file: { secure_url: string }) => file.secure_url);
  } catch (error) {
    console.error("Error getting all Cloudinary Images:", error);
    throw error;
  }
}
