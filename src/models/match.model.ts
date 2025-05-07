import mongoose, { Schema } from "mongoose";

const matchesSchema = new Schema(
  {
    user1_id: { type: String, required: true },
    user2_id: { type: String, required: true },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchesSchema);

export default Match;
