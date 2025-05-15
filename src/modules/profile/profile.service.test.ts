import { expect, test, jest, beforeEach } from "@jest/globals";
import { ProfileService } from "./profile.service";
import { LikesService } from "../likes/likes.service";
import { Location, Preferences } from "../../models";

jest.mock("cloudinary", () => {
  return {
    v2: {
      config: jest.fn(),
      uploader: {
        upload: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            secure_url: "https://test-url.com/image.jpg",
          });
        }),
      },
    },
  };
});

jest.mock("fs", () => ({
  unlinkSync: jest.fn(),
}));

jest.mock("../../models", () => {
  const mockProfile = function (data: any) {
    return {
      _id: data._id,
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      zodiacSign: data.zodiacSign,
      location: data.location,
      gender: data.gender,
      reasons: data.reasons,
      preferences: data.preferences,
      friendsAgeMin: data.friendsAgeMin,
      friendsAgeMax: data.friendsAgeMax,
      photos: data.photos,
      save: jest.fn().mockImplementation(() => Promise.resolve(data)),
    };
  };

  return {
    Profile: mockProfile,
    Location: jest.fn(),
    Preferences: jest.fn(),
    ProfileDocument: jest.fn(),
    friendSearchProjection: {},
  };
});

jest.mock("../../utils", () => ({
  dateToZodiac: jest.fn().mockReturnValue("Aries"),
  haversineDistance: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("ProfileService - should be defined", () => {
  const profileService = new ProfileService(new LikesService());
  expect(profileService).toBeDefined();
});

test("ProfileService - registerProfile should create a new profile", async () => {
  const profileService = new ProfileService(new LikesService());

  jest.spyOn(profileService, "checkProfileExists").mockResolvedValue(false);

  const userId = "Test141ID";
  const name = "Test user";
  const dateOfBirth = new Date("1990-01-01");
  const location: Location = {
    lat: 10,
    lng: 10,
    country: "Test",
    city: "Test",
    street: "Test",
    houseNumber: "Test",
  };
  const reasons = ["Test reason"];
  const gender = "Women";
  const preferences: Preferences = {
    aboutMe: "Test",
    selectedLanguages: ["Test"],
    smoking: ["Test"],
    educationalLevel: ["Test"],
    children: ["Test"],
    drinking: ["Test"],
    pets: ["Test"],
    interests: ["Test"],
  };

  const files = [
    {
      path: "temp/test-image.jpg",
      filename: "test-image.jpg",
    },
  ] as unknown as Express.Multer.File[];

  const result = await profileService.registerProfile(
    userId,
    name,
    dateOfBirth,
    location,
    reasons,
    gender,
    preferences,
    files
  );

  expect(result).toBeDefined();
  expect(result._id).toEqual(userId);
  expect(result.name).toEqual(name);
  expect(result.zodiacSign).toEqual("Aries");
});

test("ProfileService - registerProfile should throw error (Profile already exists)", async () => {
  const profileService = new ProfileService(new LikesService());

  jest.spyOn(profileService, "checkProfileExists").mockResolvedValue(true);

  const userId = "Test141ID";
  const name = "Test user";
  const dateOfBirth = new Date();
  const location = {} as Location;
  const reasons = ["Test reason"];
  const gender = "Women";
  const preferences = {} as Preferences;

  const files = [
    {
      path: "temp/test-image.jpg",
      filename: "test-image.jpg",
    },
  ] as unknown as Express.Multer.File[];

  try {
    await profileService.registerProfile(
      userId,
      name,
      dateOfBirth,
      location,
      reasons,
      gender,
      preferences,
      files
    );

    expect(true).toBe(false); // This should not be reached
  } catch (error: any) {
    expect(error.message).toBe("Profile already exists");
  }
});
