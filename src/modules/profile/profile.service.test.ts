import { expect, test, jest, beforeEach } from "@jest/globals";
import { ProfileService } from "./profile.service";
import { Location, Preferences } from "../../models";

// Mock the modules before importing the service
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

// Mock the Profile model
jest.mock("../../models", () => {
  // Create a mock Profile constructor
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

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Basic test to verify the service exists
test("ProfileService - should be defined", () => {
  const profileService = new ProfileService();
  expect(profileService).toBeDefined();
});

// Test the registerProfile method
test("ProfileService - registerProfile should create a new profile", async () => {
  // Arrange
  const profileService = new ProfileService();

  // Mock the checkProfileExists method to return false (profile doesn't exist)
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

  // Mock file object
  const files = [
    {
      path: "temp/test-image.jpg",
      filename: "test-image.jpg",
    },
  ] as unknown as Express.Multer.File[];

  // Act
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

  // Assert
  expect(result).toBeDefined();
  expect(result._id).toEqual(userId);
  expect(result.name).toEqual(name);
  expect(result.zodiacSign).toEqual("Aries");
});

// Test error handling
test("ProfileService - registerProfile should throw error (Profile already exists)", async () => {
  // Arrange
  const profileService = new ProfileService();

  // Mock the checkProfileExists method to return true (profile exists)
  jest.spyOn(profileService, "checkProfileExists").mockResolvedValue(true);

  const userId = "Test141ID";
  const name = "Test user";
  const dateOfBirth = new Date();
  const location = {} as Location;
  const reasons = ["Test reason"];
  const gender = "Women";
  const preferences = {} as Preferences;

  // Mock file object
  const files = [
    {
      path: "temp/test-image.jpg",
      filename: "test-image.jpg",
    },
  ] as unknown as Express.Multer.File[];

  // Act & Assert
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
    // If we get here, the test should fail
    expect(true).toBe(false); // This should not be reached
  } catch (error: any) {
    expect(error.message).toBe("Profile already exists");
  }
});
