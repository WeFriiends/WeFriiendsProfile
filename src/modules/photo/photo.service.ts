import { Profile } from "../../models";
import { deleteCloudinaryImage } from "../../utils";

export const getPhotos = async (id: string): Promise<string[]> => {
  try {
    const profile = await Profile.findOne({ _id: id }).exec();
    if (profile && profile.photos) {
      return profile.photos;
    }
    throw new Error(`Profile not found for user with id: ${id}`);
  } catch (err) {
    throw new Error(`Unable to get photos for user with id: ${id}`);
  }
};

export const addPhoto = async (
  id: string,
  photoUrl: string
): Promise<string[]> => {
  try {
    const profile = await Profile.findOne({ _id: id }).exec();
    if (profile && profile.photos) {
      if (profile.photos?.length < 10) {
        const updatedProfile = await Profile.findOneAndUpdate(
          { _id: id },
          { $addToSet: { photos: photoUrl } },
          { new: true }
        ).exec();
        if (updatedProfile) {
          return updatedProfile.photos || [];
        }
      } else {
        throw new Error(
          `Max allowed amount of photos is already added for user with id: ${id}`
        );
      }
    }
    throw new Error(`Profile not found for user with id: ${id}`);
  } catch (err) {
    throw new Error(`Unable to update photos for user with id: ${id}`);
  }
};

export const removePhoto = async (
  id: string,
  photoId: string
): Promise<string[]> => {
  try {
    const profile = await Profile.findOne({ _id: id }).exec();
    if (!profile) {
      throw new Error(`Profile not found for user with id: ${id}`);
    }

    const photoUrl = profile.photos?.find((photo) => photo.includes(photoId));
    if (!photoUrl) {
      throw new Error(`Photo not found in profile`);
    }

    const urlParts = photoUrl.split("/");
    const publicId = urlParts
      .slice(urlParts.indexOf("upload") + 2)
      .join("/")
      .replace(/\.[^/.]+$/, "");

    await deleteCloudinaryImage(publicId);

    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: id },
      { $pull: { photos: photoUrl } },
      { new: true }
    ).exec();

    if (updatedProfile) {
      return updatedProfile.photos || [];
    }
    throw new Error(`Profile not found for user with id: ${id}`);
  } catch (err) {
    throw new Error(`Unable to update photos for user with id: ${id}`);
  }
};
