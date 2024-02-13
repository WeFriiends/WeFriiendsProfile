const profileService = require("../services/profile");
const passport = require("passport");

// This route create user profile
module.exports = (app) => {
  console.log("1, post");
  app.post(
    "/api/profiles",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      console.log("2, post");
      profileService
        .registerProfile(req.user.userId, req.body)
        .then((profile) => {
          res.status(200).json(profile);
        })
        .catch((msg) => {
          res.status(422).json({ error: msg });
        });
    }
  );
};
