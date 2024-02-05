const request = require("supertest");
const express = require("express");
const profileRoute = require("../routes/delete-routes");
const mockingoose = require("mockingoose");
const passport = require("passport");
const jwtSecret = require("../middleware/token-strategy");

const model = require("../models/Profile");
const jwt = require("jsonwebtoken");

describe("DELETE /api/profile", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(passport.initialize());
    profileRoute(app);
  });

  it("deletes profile when exists", async () => {
    const userId = "test-user-id";
    const _existingProfile = {
      _id: "65bf74e4bbc75c11e6e83ce0",
      name: "",
      dob: "1998-12-31T23:00:00.000Z",
      zodiacSign: "",
      gender: "F",
      reason: [],
      location: {},
      bio: "",
      photos: [],
    };

    mockingoose(model).toReturn(_existingProfile, "findOneAndRemove");

    const payload = {
      _id: "123",
      userId,
    };
    const token = jwt.sign(payload, jwtSecret);

    const response = await request(app)
      .delete(`/api/profiles/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
  });

  it("returns 401 if trying to delete someone else's profile", async () => {
    const userId = "test-user-id";
    const anotherId = "someone-else's-id";

    const _existingProfile = {
      _id: "65bf74e4bbc75c11e6e83ce0",
      name: "",
      dob: "1998-12-31T23:00:00.000Z",
      zodiacSign: "",
      gender: "F",
      reason: [],
      location: {},
      bio: "",
      photos: [],
    };

    mockingoose(model).toReturn(_existingProfile, "findOneAndRemove");

    const someoneElsesPayload = {
      _id: "789",
      anotherId,
    };

    const token = jwt.sign(someoneElsesPayload, jwtSecret);

    const response = await request(app)
      .delete(`/api/profiles/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(401);
  });

  it("doesn't delete profile if not authed", async () => {
    const userId = "test-user-id";

    const response = await request(app).delete(`/api/profiles/${userId}`);

    expect(response.statusCode).toBe(401);
  });
});
