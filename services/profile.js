const mongoose = require("mongoose");
let Profile = mongoose.model("profiles");

module.exports.registerProfile = async (userId) => {
    let profileToSave = ({
        userId: userId,
    });
    try {
        await profileToSave.save();
    } catch (err) {
        if (err.code == 11000) {
            return ("This userId is already associated with an account");
        }
        return "There was an error creating the profile: " + err;
    }
};

// This function returns user info including current age
module.exports.getProfileInfo = (userId) => {
  return new Promise((resolve, reject) => {
    Profile.findOne({
      userId: userId,
    })
      .exec()
      .then((profile) => {
        if (!profile) {
          reject("No profile found");
        }
        if (profile.dob) {
            const age =  calculateAge(profile);
            let updObject = { age: age };
            let profileWithAge = Object.assign(updObject, profile._doc);
          resolve(profileWithAge);
        }
        resolve(profile);
      })
      .catch((err) => reject(err));
  });
};

const calculateAge = (profile) => {
    let ageDifference = Date.now() - profile.dob.getTime();
    let ageDateObject = new Date(ageDifference);
    let ageTemp = ageDateObject.getUTCFullYear() - 1970;
    let age = ageTemp > 0 ? ageTemp : 0;
    return age;
}

// This function deletes user profile from a database
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
