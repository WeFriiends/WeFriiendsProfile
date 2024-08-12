import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  // Add other fields as necessary
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Define other fields here
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
