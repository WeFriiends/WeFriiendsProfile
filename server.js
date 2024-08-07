if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill for Array.prototype.flatMap
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function(callback) {
    return Array.prototype.concat.apply([], this.map(callback));
  };
}

const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const passport = require("passport");

require("./models/Profile");
require("./models/User");
require("./models/Chat"); 
require("./services/interests");
require("./services/dateToZodiac");
require("./services/location");
require("./services/photo");
require("./services/profile");
require("./middleware/token-strategy");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

require("./routes/photo-routes")(app);
require("./routes/update-routes")(app);
require("./routes/get-routes")(app);
require("./routes/delete-routes")(app);
require("./routes/post-routes")(app);
require("./routes/user-routes")(app); 
require("./routes/chat-routes")(app); 

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  console.log("Connected to MongoDB");
  app.listen(HTTP_PORT, () => {
    console.log("API listening on: " + HTTP_PORT);
  });
}).catch((error) => {
  console.error("Error connecting to MongoDB: ", error);
});

module.exports = app;
