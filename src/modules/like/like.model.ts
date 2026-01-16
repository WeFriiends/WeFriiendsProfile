import mongoose, { Schema } from "mongoose";

const LikedUserSchema = new Schema(
  {
    liked_id: { type: String, required: true },
    liked_at: { type: Date, required: true },
  },
  { timestamps: true }
);

const likeSchema = new Schema(
  {
    liker_id: { type: String, required: true },
    likes: { type: [LikedUserSchema], required: true },
  },
  { timestamps: true }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;
