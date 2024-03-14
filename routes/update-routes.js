/* Routes for modifying user data */
const passport = require("passport");
const profileService = require("../services/profile");

module.exports = (app) => {
  app.patch(
    "/api/profiles/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      const { id } = req.params;
      //check if I work with my personal profile
      if (id !== req.user.userId) {
        res.status(401).json({ message: "Access denied" });
        return;
      }

      profileService
        .updateProfile(req.user.userId, req.body)
        .then((profile) => {
          res.status(200).json(profile);
        })
        .catch((msg) => {
          res.status(422).json({ error: msg });
        });
    }
  );
};
