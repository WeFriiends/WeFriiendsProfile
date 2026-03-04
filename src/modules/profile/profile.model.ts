import mongoose, { Document, Schema } from "mongoose";

export enum Gender {
  Male = "male",
  Female = "female"
}

export interface Location {
  lat: number;
  lng: number;
  country: string;
  city: string;
  street?: string;
  houseNumber?: string;
}

export interface Preferences {
  aboutMe?: string;
  selectedLanguages?: string[];
  smoking?: string[];
  educationalLevel?: string[];
  children?: string[];
  drinking?: string[];
  pets?: string[];
  interests?: string[];
}

export interface ProfileDocument extends Document {
  _id: string;
  name: string;
  dateOfBirth: Date;
  location: Location;
  zodiacSign: string;
  photos?: string[];
  gender: Gender;
  reasons: string[];
  preferences?: Preferences;
  friendsAgeMin?: number;
  friendsAgeMax?: number;
  friendsDistance?: number;
  blackList?: string[];
}

const profileSchema = new Schema<ProfileDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    zodiacSign: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      country: { type: String },
      city: { type: String },
      street: { type: String },
      houseNumber: { type: String },
    },
    photos: { type: [String], default: [] },
    gender: {type: String, enum: Object.values(Gender), required: true},
    reasons: { type: [String], default: [] },
    preferences: {
      aboutMe: { type: String },
      selectedLanguages: { type: [String], default: [] },
      smoking: { type: [String], default: [] },
      educationalLevel: { type: [String], default: [] },
      children: { type: [String], default: [] },
      drinking: { type: [String], default: [] },
      pets: { type: [String], default: [] },
      interests: { type: [String], default: [] },
    },
    friendsAgeMin: { type: Number, default: 18 },
    friendsAgeMax: { type: Number, default: 60 },
    friendsDistance: { type: Number, default: 50 },
    blackList: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Profile = mongoose.model<ProfileDocument>("Profile", profileSchema);

export default Profile;
