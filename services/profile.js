const Profile = require("../models/Profile");
const dateToZodiac = require("./date");

module.exports.registerProfile = async (userId) => {
  let profileToSave = new Profile({
    userId: userId,
  });
  return await profileToSave.save();
};

module.exports.getProfileInfo = async (userId) => {
  const profile = await Profile.findOne({ userId: userId });

  if (!profile) {
    return;
  } else {
    if (profile.dob) {
      const age = calculateAge(profile);
      let updObject = { age: age };
      let profileWithAge = Object.assign(updObject, profile._doc);
      return profileWithAge;
    } else {
      return profile;
    }
  }
};

const calculateAge = (profile) => {
  let ageDifference = Date.now() - profile.dob.getTime();
  let ageDateObject = new Date(ageDifference);
  let ageTemp = ageDateObject.getUTCFullYear() - 1970;
  let age = ageTemp > 0 ? ageTemp : 0;
  return age;
};

module.exports.deleteProfile = async (id) => {
  try {
    await Profile.deleteOne({
      userId: id,
    }).exec();
    return "User has been deleted successfully";
  } catch (err) {
    throw err;
  }
};

module.exports.updateProfile = async (id, data) => {
  try {
    if (data.dob) {
      data = { ...data, zodiacSign: dateToZodiac(data.date) };
    }
    const updatedProfile = await Profile.findByIdAndUpdate(
      { userId: id },
      data
    );
    return updatedProfile;
  } catch (err) {
    throw err;
  }
};
