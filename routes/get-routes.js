const profile = require("../services/profile");
const passport = require("passport");

module.exports = (app) => {
  app.get(
    "/api/profile",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const existingProfile = await profile.getProfileInfo(req.user.userId);
        console.log("got profile ", existingProfile);
        if (existingProfile) {
          res.json(existingProfile);
        } else {
          const result = await profile.registerProfile(req.user.userId);
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

      //   profile
      //     .getProfileInfo(req.user.userId)
      //     .then((profile) => res.json({ profile: profile, message: "Success" }))
      //     .catch((err) => {
      //       console.log(err);
      //       profile
      //         .registerProfile(req.user.userId)
      //         .then((profile) => {
      //           res.json({
      //             profile: profile,
      //             message: "Registered new profile for a user" + req.user.userId,
      //           });
      //         })
      //         .catch((err) => {
      //           res.status(422).json({ message: err });
      //         });
      //     });
    }
  );
};
