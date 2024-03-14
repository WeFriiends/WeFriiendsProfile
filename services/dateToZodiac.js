const zodiac = require("zodiac-signs")("en");

module.exports.dateToZodiac = (date) =>
  zodiac.getSignByDate({ day: date.getDate(), month: date.getMonth() + 1 })
    .name;
