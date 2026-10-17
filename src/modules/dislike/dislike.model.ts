import mongoose, { Schema, InferSchemaType } from "mongoose";

const dislikedUserSchema = new Schema({
  disliked_id: { type: String, required: true },
  disliked_at: { type: Date, required: true },
});

const dislikeSchema = new Schema({
  disliker_id: { type: String, required: true },
  dislikes: { type: [dislikedUserSchema], required: true },
});

export type IDislike = InferSchemaType<typeof dislikeSchema>;

const Dislike = mongoose.model("Dislike", dislikeSchema);

export default Dislike;
