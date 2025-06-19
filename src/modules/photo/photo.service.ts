import { Profile } from "../../models";
import { deleteCloudinaryImage } from "../../utils";

export const getPhotos = async (id: string): Promise<string[]> => {
  const profile = await Profile.findOne({ _id: id }).exec();
  if (!profile) {
    throw new Error(`Profile not found for user with id: ${id}`);
  }
  return profile.photos || [];
};

export const addPhoto = async (
  id: string,
  photoUrl: string
): Promise<string[]> => {
  const updatedProfile = await Profile.findOneAndUpdate(
    { 
      _id: id,
      $expr: { $lt: [{ $size: { $ifNull: ["$photos", []] } }, 10] }
    },
    { $addToSet: { photos: photoUrl } },
    { new: true }
  ).exec();

  if (!updatedProfile) {
    const profile = await Profile.findOne({ _id: id }).exec();
    if (!profile) {
      throw new Error(`Profile not found for user with id: ${id}`);
    }
    throw new Error(`Max allowed amount of photos is already added for user with id: ${id}`);
  }

  return updatedProfile.photos || [];
};

export const removePhoto = async (
  id: string,
  photoId: string
): Promise<string[]> => {
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

  return updatedProfile?.photos || [];
};
