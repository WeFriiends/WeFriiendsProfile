const mongoose = require("mongoose");
let Profile = mongoose.model("profiles");

module.exports.addGender = (id, gender) => {
  return new Promise((resolve, reject) => {
    Profile.find({
      userId: id,
    })
      .exec()
      .then((profile) => {
        if (gender != "M") {
          Profile.findOneAndUpdate(
            { userId: id },
            { gender: gender },
            { new: true }
          )
            .exec()
            .then((profile) => {
              resolve(profile.gender);
            })
            .catch((err) => {
              reject(`Unable to add gender for user with id: ${id}`);
            });
        } else {
          reject("Service is only available for users who identify as female");
        }
      });
  });
};

module.exports.addName = async (id, name) => {
  console.log("in add name")
  try {
    const profile = await Profile.find({ userId: id });
  if (profile) {
    const response = await Profile.updateOne(
      { userId: id },
      {
        $set: {
          name: name,
        },
        $currentDate: { lastUpdated: true },
      }
    );
    console.log("response ", response)
  }
  } catch (e) {
    console.log(e)
  }
  
};

module.exports.getName = (id) => {
  return new Promise((resolve, reject) => {
    Profile.find({
      userId: id,
    })
      .exec()
      .then((profile) => {
        resolve(profile.name);
      })
      .catch((err) => {
        reject(`Unable to get name for user with id: ${id}`);
      });
  });
};

// This function adds a short description or updates description if name already exists
module.exports.addBio = (id, bio) => {
    return new Promise((resolve, reject) => {
        Profile.find({
        userId: id,
        })
        .exec()
        .then((profile) => {
            Profile.findOneAndUpdate({ userId: id }, { bio: bio }, { new: true })
            .exec()
            .then((profile) => {
                resolve(profile.bio);
            })
            .catch((err) => {
                reject(`Unable to update bio for user with id: ${id}`);
            });
        });
    });
};
