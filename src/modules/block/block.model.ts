import mongoose, { Document, Schema } from "mongoose";

export interface BlockDocument extends Document {
  blockerUserId: string;
  blockedUserId: string;
  createdAt: Date;
}

const blockSchema = new Schema<BlockDocument>(
  {
    blockerUserId: { type: String, required: true, index: true },
    blockedUserId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Ensure each pair is unique
blockSchema.index({ blockerUserId: 1, blockedUserId: 1 }, { unique: true });

const Block = mongoose.model<BlockDocument>("Block", blockSchema);

export default Block;
