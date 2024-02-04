const mongoose = require("mongoose");
const Profile = require("../models/Profile");

module.exports.registerProfile = async (userId) => {
  console.log("in registering new profile");
  let profileToSave = new Profile({
    userId: userId,
  });
  console.log("new profile ", profileToSave);
  try {
    await profileToSave.save();
  } catch (err) {
    if (err.code == 11000) {
      return "This userId is already associated with an account";
    }
    return err.code;
  }
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

module.exports.deleteProfile = (id) => {
  return new Promise((resolve, reject) => {
    Profile.deleteOne({
      userId: id,
    })
      .exec()
      .then(() => {
        resolve("User has been deleted successfully");
      })
      .catch((err) => {
        reject(err);
      });
  });
};
