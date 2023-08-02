const profile = require("../services/profile");
const passport = require("passport");

module.exports = (app) => {
  app.get(
    "/api/profile",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const profile = await getProfileInfo(req.user.userId);
        console.log('got profile ', profile);
        if (profile) {
          res.json({ profile });
        } else {
            console.log('profile doesnt exist ')
            
          const result = await registerProfile(req.user.userId);
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
