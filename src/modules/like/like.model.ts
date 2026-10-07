import mongoose, { Schema, InferSchemaType } from "mongoose";

const LikedUserSchema = new Schema({
  liked_id: { type: String, required: true },
  liked_at: { type: Date, required: true },
});

const likeSchema = new Schema({
  liker_id: { type: String, required: true },
  likes: { type: [LikedUserSchema], required: true },
});

export type ILike = InferSchemaType<typeof likeSchema>;

const Like = mongoose.model("Like", likeSchema);

export default Like;