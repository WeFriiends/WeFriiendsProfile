const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSchema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      index: true,
    },
    name: String,
    dob: Date,
    zodiacSign: String,
    gender: {
      type: String,
      enum: ["M", "F"],
      default: "F",
    },
    reason: [String],
    location: {
      type: Map,
      of: String,
    },
    bio: String,
    photos: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("profiles", profileSchema);
