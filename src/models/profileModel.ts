import mongoose, { Document, Schema } from "mongoose";

interface Location {
  lat: number;
  lng: number;
  country: string;
  city: string;
}

export interface ProfileDocument extends Document {
  _id: string;
  name: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
  location?: Location;
  zodiacSign: string;
}

const profileSchema = new Schema<ProfileDocument>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  zodiacSign: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    country: { type: String },
    city: { type: String },
  },
});

const Profile = mongoose.model<ProfileDocument>("Profile", profileSchema);

export default Profile;
