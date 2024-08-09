import mongoose from "mongoose";
import Profile from "../models/profileModel";

export const getPhotos = async (id: string): Promise<string[]> => {
  try {
    const profile = await Profile.findOne({ userId: id }).exec();
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
    const profile = await Profile.findOne({ userId: id }).exec();
    if (profile && profile.photos) {
      if (profile.photos?.length < 10) {
        const updatedProfile = await Profile.findOneAndUpdate(
          { userId: id },
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
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: id },
      { $pull: { photos: photoId } },
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
