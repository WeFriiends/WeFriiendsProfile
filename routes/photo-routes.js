const multer = require("multer");
const passport = require("passport");
const cloudinary = require('../config/cloudinary');
const photoService = require("../services/photo");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = (app) => {
  app.post(
    "/api/profile/upload",
    passport.authenticate("jwt", { session: false }),
    upload.single("file"),
    async (req, res) => {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.buffer, { folder: "profile" });

        await photoService.addPhoto(req.user.userId, uploadResult.url);

        return res.status(200).send({ message: "Photo uploaded successfully", cloudinary: uploadResult });
      } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Error uploading photo" });
      }
    }
  );
};
