const Profile = require("../models/Profile");

/* This service will set location for users who manually update it */

// This function returns location object for a user with id passed as a parameter
module.exports.getLocation = (id) => {
  return new Promise((resolve, reject) => {
    Profile.find({
      userId: id,
    })
      .exec()
      .then((profile) => {
        resolve(profile.location);
      })
      .catch((err) => {
        reject(`User with id: ${id} hasn't shared their location yet`);
      });
  });
};

// This function adds location object for users
module.exports.setLocation = (id, coordinates, country, city) => {
  return new Promise((resolve, reject) => {
    Profile.findOneAndUpdate(
      { userId: id },
      {
        $set: {
          location: {
            lat: coordinates.lat,
            lng: coordinates.lng,
            country: country,
            city: city,
          },
        },
      }
    )
      .exec()
      .then((profile) => {
        resolve(profile.location);
      })
      .catch((err) => {
        reject(`Unable to update location for user with id: ${id}`);
      });
  });
};
