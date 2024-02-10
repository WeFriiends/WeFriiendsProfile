const request = require("supertest");
const mockingoose = require("mockingoose");
const jwtSecret = require("../middleware/token-strategy");

const model = require("../models/Profile");
const jwt = require("jsonwebtoken");
const app = require("../server");

describe("GET /api/profile", () => {
  it("returns profile when exists", async () => {
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

    const payload = {
      _id: "123",
      userId: userId,
    };
    const token = jwt.sign(payload, jwtSecret);

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ..._existingProfile, age: 25 });
  });

  it("doesn't returns existing profile if not authed", async () => {
    const response = await request(app).get("/api/profile");

    expect(response.statusCode).toBe(401);
  });
});
