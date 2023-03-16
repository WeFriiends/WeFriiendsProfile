const mongoose = require("mongoose");
let Profile = mongoose.model("profiles");

module.exports.registerProfile = (userId) => {
  return new Promise((resolve, reject) => {
    let newProfile = new Profile({
      userId: userId,
    });
    console.log("Trying to register");
    newProfile
      .save((err) => {
        if (err) {
          if (err.code == 11000) {
            reject("This userId is already associated with an account");
          } else {
            reject("There was an error creating the profile: " + err);
          }
        }
        resolve(newProfile);
      })
      .catch((err) => reject(err));
  });
};

module.exports.getProfileInfo = async(userId, req, res) => {
    try {
        const foundProfile = await Profile.findOne({userId: userId});
        if (!foundProfile) {
          console.log("no profile")
            return ("Profile not found");
        }
        if (foundProfile.dob) {
          console.log("profile with dob")
            const age =  calculateAge(profile);
            let updObject = { age: age };
            let profileWithAge = Object.assign(updObject, foundProfile._doc);
            return rofileWithAge;
        }
      console.log("return foundProfile ", foundProfile)
        return foundProfile;
    } catch(err) {
      console.log("in error ", err)
        return err
    }}
   

// This function returns user info including current age
// module.exports.getProfileInfo = (userId) => {
//   return new Promise((resolve, reject) => {
//     Profile.findOne({
//       userId: userId,
//     })
//       .exec()
//       .then((profile) => {
//         if (!profile) {
//           reject("No profile found");
//         }
//         if (profile.dob) {
//             const age =  calculateAge(profile);
//             let updObject = { age: age };
//             let profileWithAge = Object.assign(updObject, profile._doc);
//           resolve(profileWithAge);
//         }
//         resolve(profile);
//       })
//       .catch((err) => reject(err));
//   });
// };

// const calculateAge = (profile) => {
//     let ageDifference = Date.now() - profile.dob.getTime();
//     let ageDateObject = new Date(ageDifference);
//     let ageTemp = ageDateObject.getUTCFullYear() - 1970;
//     let age = ageTemp > 0 ? ageTemp : 0;
//     return age;
// }

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
