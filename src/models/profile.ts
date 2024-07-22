import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema = new Schema({
  _id: String,
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", ProfileSchema);
