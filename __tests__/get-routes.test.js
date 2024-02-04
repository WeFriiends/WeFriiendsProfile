const request = require("supertest");
const express = require("express");
const profileRoute = require("../routes/get-routes");
const mockingoose = require("mockingoose");
const passport = require("passport");
require("../middleware/token-strategy");

const model = require("../models/Profile");
const jwt = require("jsonwebtoken");

describe("GET /api/profile", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(passport.initialize());
    profileRoute(app);
  });

  it("returns existing profile", async () => {
    const userId = "test-user";
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

    mockingoose(model).toReturn(_existingProfile, "findOne");

    let payload = {
      _id: "123",
      userId: userId,
    };
    let token = jwt.sign(payload, "secret");

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ..._existingProfile, age: 25 });
  });
});
