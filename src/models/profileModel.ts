import mongoose, { Document, Schema } from "mongoose";

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
  Smoking?: string[];
  EducationalLevel?: string[];
  Children?: string[];
  Drinking?: string[];
  Pets?: string[];
  Interests?: string[];
}

export interface ProfileDocument extends Document {
  _id: string;
  name: string;
  dateOfBirth: Date;
  location: Location;
  zodiacSign: string;
  photos?: string[];
  gender: string;
  reasons: string[];
  preferences?: Preferences;
  friendsAgeMin?: number;
  friendsAgeMax?: number;
  friendsDistance?: number;
  blackList?: string[];
  friends?: string[];
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
    gender: { type: String },
    reasons: { type: [String], default: [] },
    preferences: {
      aboutMe: { type: String },
      selectedLanguages: { type: [String], default: [] },
      Smoking: { type: [String], default: [] },
      EducationalLevel: { type: [String], default: [] },
      Children: { type: [String], default: [] },
      Drinking: { type: [String], default: [] },
      Pets: { type: [String], default: [] },
      Interests: { type: [String], default: [] },
    },
    friendsAgeMin: { type: Number, default: 18 },
    friendsAgeMax: { type: Number },
    friendsDistance: { type: Number, default: 50 },
    blackList: { type: [String], default: [] },
    friends: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Profile = mongoose.model<ProfileDocument>("Profile", profileSchema);

export default Profile;
