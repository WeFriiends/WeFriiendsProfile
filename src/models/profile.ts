import mongoose, { Document, Schema } from "mongoose";

export interface Location {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  country: string;
  city: string;
  street?: string;
  houseNumber?: string;
}

interface Photo {
  id: string;
  src: string;
}

export interface ProfileDocument extends Document {
  _id: string;
  name: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
  location: Location;
  zodiacSign: string;
  photos?: Photo[];
  gender: string;
  reasons: string[];
}

const profileSchema = new Schema<ProfileDocument>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  zodiacSign: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'], // 'Point' is required by GeoJSON
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    country: { type: String },
    city: { type: String },
    street: { type: String },
    houseNumber: { type: String },
  },
  photos: {
    type: [
      {
        id: { type: String, required: true },
        path: { type: String, required: true }
      }
    ],
    default: []
  },
  gender: { type: String },
  reasons: { type: [String], default: [] },
});
profileSchema.index({ location: '2dsphere' });

const Profile = mongoose.model<ProfileDocument>("Profile", profileSchema);

export default Profile;
