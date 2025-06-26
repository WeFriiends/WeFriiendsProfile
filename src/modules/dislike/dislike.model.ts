import mongoose, { Schema } from "mongoose";

const dislikedUserSchema = new Schema({
  disliked_id: { type: String, required: true },
  disliked_at: { type: Date, required: true },
});

const dislikeSchema = new Schema({
  disliker_id: { type: String, required: true },
  dislikes: { type: [dislikedUserSchema], required: true },
});

const Dislike = mongoose.model("Dislike", dislikeSchema);

export default Dislike;
