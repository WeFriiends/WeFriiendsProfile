import Profile, { Location } from "../models/profileModel";

export const getLocation = async (id: string) => {
  try {
    const profile = await Profile.findOne({ userId: id }).exec();
    if (profile) {
      return profile.location;
    } else {
      throw new Error(`User with id: ${id} hasn't shared their location yet`);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};

export const setLocation = async (id: string, location: Location) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: id },
      {
        $set: {
          location,
        },
      },
      { new: true }
    ).exec();

    if (profile) {
      return profile.location;
    } else {
      throw new Error(`Unable to update location for user with id: ${id}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
