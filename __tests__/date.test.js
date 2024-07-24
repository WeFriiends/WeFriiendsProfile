const dateService = require("../services/dateToZodiac");

describe("date service", () => {
  it("calculates a zodiac sign correctly", () => {
    const dateOfBirth = new Date(1998, 7, 22);

    expect(dateService.dateToZodiac(dateOfBirth)).toBe("Leo");
  });
});
