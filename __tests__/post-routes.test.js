const request = require("supertest");
const express = require("express");
const postRoute = require("../routes/post-routes");
const mockingoose = require("mockingoose");
const passport = require("passport");
const jwtSecret = require("../middleware/token-strategy");

const model = require("../models/Profile");
const jwt = require("jsonwebtoken");

describe("POST /api/profiles", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(passport.initialize());
    postRoute(app);
  });

  it("returns empty profile if no data added", async () => {
    const userId = "test-user";
    const _newProfile = {};

    const payload = {
      _id: "123",
      userId,
    };
    const token = jwt.sign(payload, jwtSecret);

    mockingoose(model).toReturn(
      {
        _id: "65bf9ea7440ab1733c4a4e39",
        gender: "F",
        photos: [],
        reason: [],
        userId,
      },
      "save"
    );

    const response = await request(app)
      .post("/api/profiles")
      .send(_newProfile)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      _id: "65bf9ea7440ab1733c4a4e39",
      gender: "F",
      photos: [],
      reason: [],
      userId,
    });
  });

  it("doesn't create profile if not authed", async () => {
    const response = await request(app).post("/api/profiles");

    expect(response.statusCode).toBe(401);
  });
});
