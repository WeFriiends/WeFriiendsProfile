const profile = require("../services/profile");
const passport = require("passport");

module.exports = (app) => {
  app.get(
    "/api/profile/delete",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      profile
        .deleteProfile(req.user.userId)
        .then((msg) => res.json({ message: msg }))
        .catch((err) => {
          console.log(err);
          res.status(422).json({ message: err });
        });
    }
  );

  app.delete(
    "/api/profiles/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      const { id } = req.params;

      if (id !== req.user.userId) {
        res.status(401).json({ message: "Access denied" });
        return;
      }

      profile
        .deleteProfile(id)
        .then((msg) => res.json({ message: msg }))
        .catch((err) => {
          console.log(err);
          res.status(422).json({ message: err });
        });
    }
  );
};
