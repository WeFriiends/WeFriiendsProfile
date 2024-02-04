const profileService = require("../services/profile");
const passport = require("passport");

// This route create user profile
module.exports = (app) => {
  app.post(
    "/api/profiles",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      profileService
        .registerProfile(req.user.userId, req.body)
        .then(() => {
          res.status(200).json({
            message: "Profile has been successfully created",
          });
        })
        .catch((msg) => {
          res.status(422).json({ error: msg });
        });
    }
  );
};
