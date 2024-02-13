const request = require("supertest");
const mockingoose = require("mockingoose");
const jwtSecret = require("../middleware/token-strategy");

const model = require("../models/Profile");
const jwt = require("jsonwebtoken");
const app = require("../server");

describe("UPDATE /api/profiles/:id", () => {
  it("updates profile when exists", async () => {
    const userId = "test-user-id";

    const changes = {
      name: "Jane Dow",
    };

    const _updatedProfile = {
      _id: "65bf74e4bbc75c11e6e83ce0",
      name: "Jane Dow",
      dob: "1998-12-31T23:00:00.000Z",
      zodiacSign: "",
      gender: "F",
      reason: [],
      location: {},
      bio: "",
      photos: [],
    };

    mockingoose(model).toReturn(_updatedProfile, "findOneAndUpdate");

    const payload = {
      _id: "123",
      userId,
    };
    const token = jwt.sign(payload, jwtSecret);

    const response = await request(app)
      .patch(`/api/profiles/${userId}`)
      .send(changes)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(_updatedProfile);
  });

  it("returns 401 if trying to update someone else's profile", async () => {
    const userId = "test-user-id";
    const anotherId = "someone-else's-id";

    const changes = {
      name: "Jane Dow",
    };

    const _updatedProfile = {
      _id: "65bf74e4bbc75c11e6e83ce0",
      name: "Jane Dow",
      dob: "1998-12-31T23:00:00.000Z",
      zodiacSign: "",
      gender: "F",
      reason: [],
      location: {},
      bio: "",
      photos: [],
    };

    mockingoose(model).toReturn(_updatedProfile, "findOneAndUpdate");

    const someoneElsesPayload = {
      _id: "789",
      anotherId,
    };

    const token = jwt.sign(someoneElsesPayload, jwtSecret);

    const response = await request(app)
      .patch(`/api/profiles/${userId}`)
      .send(changes)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
  });

  it("doesn't update profile if not authed", async () => {
    const userId = "test-user-id";
    const changes = {
      name: "Jane Dow",
    };

    const response = await request(app)
      .patch(`/api/profiles/${userId}`)
      .send(changes);

    expect(response.statusCode).toBe(401);
  });

  it("returns 422 when trying to update non-existent property", async () => {
    const userId = "test-user-id";

    const changes = {
      nonExistentKey: "updatedValue",
    };

    const _existingProfile = {
      _id: "65bf74e4bbc75c11e6e83ce0",
      name: "Jane Dow",
      dob: "1998-12-31T23:00:00.000Z",
      zodiacSign: "",
      gender: "F",
      reason: [],
      location: {},
      bio: "",
      photos: [],
    };

    mockingoose(model).toReturn(_existingProfile, "findOneAndUpdate");

    const payload = {
      _id: "123",
      userId,
    };
    const token = jwt.sign(payload, jwtSecret);

    const response = await request(app)
      .patch(`/api/profiles/${userId}`)
      .send(changes)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(422);
  });
});
