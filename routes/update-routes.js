/* Routes for modifying user data */
const passport = require("passport");
const profileService = require("../services/name-gender-bio");
const dateService = require("../services/date");
const locationService = require("../services/location");
const additionalInfoService = require("../services/interests");
const maxmind = require("maxmind");
const fs = require("fs");
const buffer = fs.readFileSync("./lib/GeoLite2-City.mmdb");
const lookup = new maxmind.Reader(buffer);

module.exports = (app) => {
  // // This route sets date of birth and zodiac sign of the user
  // app.post(
  //   "/api/profile/dob",
  //   passport.authenticate("jwt", { session: false }),
  //   (req, res) => {
  //     //modifying date into <YYYY-mm-dd> format
  //     let dobString = `<${req.body.year}-${
  //       req.body.month < 10 ? "0" + req.body.month : req.body.month
  //     }-${req.body.day < 10 ? "0" + req.body.day : req.body.day}>`;
  //     dateService
  //       .addDateOfBirthAndZodiac(req.user.userId, dobString)
  //       .then((data) => {
  //         res.json(data);
  //       })
  //       .catch((msg) => {
  //         res.status(422).json({ error: msg });
  //       });
  //   }
  // );

  // This route update user profile
  app.put(
    "/api/profiles/update",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      //modifying date into <YYYY-mm-dd> format
      let dobString = `<${req.body.year}-${
        req.body.month < 10 ? "0" + req.body.month : req.body.month
      }-${req.body.day < 10 ? "0" + req.body.day : req.body.day}>`;
      dateService.addDateOfBirthAndZodiac(req.user.userId, dobString);

      const userIP = req.headers["x-forwarded-for"] || req.ip;
      const info = lookup.get(userIP);
      if (!info || !info.country || !info.city || !info.location) {
        res.status(400).json({ error: "Location is not defined" });
        return;
      }
      locationService.setLocation(
        req.user.userId,
        { lat: info.location.latitude, lng: info.location.longitude },
        info.country.iso_code,
        info.city.names.en
      );

      profileService
        .updateProfile(req.user.userId, req.body)
        .then(() => {
          res.status(200).json({
            message: "Profile has been successfully updated",
          });
        })
        .catch((msg) => {
          res.status(422).json({ error: msg });
        });
    }
  );

  // //This route sets geolocation of a user in the profile
  // app.put(
  //   "/api/profile/location/geo",
  //   passport.authenticate("jwt", { session: false }),
  //   (req, res) => {
  //     const userIP = req.headers["x-forwarded-for"] || req.ip;
  //     const info = lookup.get(userIP);

  //     if (!info || !info.country || !info.city || !info.location) {
  //       res.status(400).json({ error: "Location is not defined" });
  //       return;
  //     }
  //     locationService
  //       .setLocation(
  //         req.user.userId,
  //         { lat: info.location.latitude, lng: info.location.longitude },
  //         info.country.iso_code,
  //         info.city.names.en
  //       )
  //       .then((data) => {
  //         res.json(data);
  //       })
  //       .catch((msg) => {
  //         res.status(422).json({ error: msg });
  //       });
  //   }
  // );
};
