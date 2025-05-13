import mongoose, { Schema } from "mongoose";

const LikedUserSchema = new Schema({
  liked_id: { type: String, required: true },
  liked_at: { type: Date, required: true },
});

const likesSchema = new Schema({
  liker_id: { type: String, required: true },
  likes: { type: [LikedUserSchema], required: true },
});

const Likes = mongoose.model("Likes", likesSchema);

export default Likes;
