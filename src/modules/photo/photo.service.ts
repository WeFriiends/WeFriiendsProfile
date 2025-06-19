import { Profile } from "../../models";
import { deleteCloudinaryImage } from "../../utils";

export const getPhotos = async (userId: string): Promise<string[]> => {
  const profile = await Profile.findOne({ _id: userId }).exec();
  if (!profile) {
    throw new Error(`Profile not found for user with id: ${userId}`);
  }
  return profile.photos || [];
};

export const addPhoto = async (
  userId: string,
  photoUrl: string
): Promise<string[]> => {
  const updatedProfile = await Profile.findOneAndUpdate(
    { 
      _id: userId,
      $expr: { $lt: [{ $size: { $ifNull: ["$photos", []] } }, 10] }
    },
    { $addToSet: { photos: photoUrl } },
    { new: true }
  ).exec();

  if (!updatedProfile) {
    const profile = await Profile.findOne({ _id: userId }).exec();
    if (!profile) {
      throw new Error(`Profile not found for user with id: ${userId}`);
    }
    throw new Error(`Max allowed amount of photos is already added for user with id: ${userId}`);
  }

  return updatedProfile.photos || [];
};

export const removePhoto = async (
  userId: string,
  passedPhotoUrl: string
): Promise<string[]> => {
  const profile = await Profile.findOne({ _id: userId }).exec();
  if (!profile) {
    throw new Error(`Profile not found for user with id: ${userId}`);
  }

  const photoUrl = profile.photos?.find((photo) => photo.includes(passedPhotoUrl));
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
    { _id: userId },
    { $pull: { photos: photoUrl } },
    { new: true }
  ).exec();

  return updatedProfile?.photos || [];
};
