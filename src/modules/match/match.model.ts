import mongoose, { Schema } from "mongoose";

const matchesSchema = new Schema(
  {
    user1_id: { type: String, required: true },
    user2_id: { type: String, required: true },
    user1_seen: { type: Boolean, default: false },
    user2_seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchesSchema);

export default Match;
