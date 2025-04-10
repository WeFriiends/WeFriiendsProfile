import mongoose, { Schema } from "mongoose";

const dislikedUserSchema = new Schema({
  disliked_id: { type: String, required: true },
  disliked_at: { type: Date, required: true },
});

const dislikesSchema = new Schema({
  disliker_id: { type: String, required: true },
  dislikes: { type: [dislikedUserSchema], required: true },
});

const Dislikes = mongoose.model("Dislikes", dislikesSchema);

export default Dislikes;
