import mongoose, { Document, Model, Schema } from "mongoose";

interface ProfileDocument extends Document {
  userId: string;
  reasons: string[];
}

const ProfileSchema: Schema<ProfileDocument> = new Schema({
  userId: { type: String, required: true },
  reasons: { type: [String], default: [] },
});

const Profile: Model<ProfileDocument> = mongoose.model<ProfileDocument>(
  "Profile",
  ProfileSchema
);

export const getReasons = async (id: string): Promise<string[]> => {
  const profile = await Profile.findOne({ userId: id }).exec();
  if (profile) {
    return profile.reasons;
  }
  throw new Error(
    `User with id: ${id} hasn't shared any of their reasons to join yet`
  );
};

export const addReason = async (
  id: string,
  reasons: string[]
): Promise<string[]> => {
  const profile = await Profile.findOneAndUpdate(
    { userId: id },
    { $addToSet: { reasons: { $each: reasons } } },
    { new: true }
  ).exec();
  if (profile) {
    return profile.reasons;
  }
  throw new Error(`Unable to add reason to join for user with id: ${id}`);
};

export const removeReason = async (
  id: string,
  reason: string
): Promise<string[]> => {
  const profile = await Profile.findOneAndUpdate(
    { userId: id },
    { $pull: { reasons: reason } },
    { new: true }
  ).exec();
  if (profile) {
    return profile.reasons;
  }
  throw new Error(`Unable to remove reason to join for user with id: ${id}`);
};