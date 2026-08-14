import cloudinary from "../config/cloudinary";

export function formatTag(userId: string):string{
  return userId.replace("|","_");
}

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
    const result = await cloudinary.api.delete_resources_by_tag(formatTag(userId), {
      invalidate: true
    });
    console.log("All images deleted successfully:", result);

    if (result && result.deleted) {
      console.log("Images deleted successfully:", result);
      return result;
    } else {
      throw new Error("Failed to delete images or no images found");
    }
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
    throw error;
  }
}

export async function getAllMyCloudinaryImage(userId: string): Promise<string[]> {
  try{
    const result = await cloudinary.search
      .expression(`tags="${formatTag(userId)}"`)
      .max_results(500)
      .execute();
      
    if(result.total_count === 0){
      return [];
    }
    const myPhotoUrl: string[] = result.resources.map((file: { secure_url: string }) => file.secure_url);
    return myPhotoUrl;
  } catch (error) {
    console.error("Error getting all Cloudinary Images:", error);
    throw error;
  }

}
