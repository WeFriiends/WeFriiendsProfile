const profile = require("../services/profile");
const passport = require("passport");

module.exports = (app) => {
  app.get(
    "/api/profile",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        console.log("here in existing new profile ", req.user);
        const existingProfile = await profile.getProfileInfo(req.user.userId);

        if (existingProfile) {
          res.json(existingProfile);
        } else {
          console.log("here in creating new profile ", req.user);
          const result = await profile.registerProfile(req.user.userId);
          console.log("result ", result);
          if (result) {
            res.json({
              profile: result,
              message: "Registered new profile for a user" + req.user.userId,
            });
          }
        }
      } catch (e) {
        res.status(422).json({ message: e });
      }
    }
  );
};
