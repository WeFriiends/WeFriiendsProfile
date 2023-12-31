const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const passport = require("passport");

require("./models/Profile");
require("./services/interests");
require("./services/date");
require("./services/location");
require("./services/photo");
require("./services/name-gender-bio");
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
mongoose.connect(
    process.env.MONGODB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log("Connected to Mongo DB");
         app.listen(HTTP_PORT, () => {
        console.log("API listening on: " + HTTP_PORT);
    });
    }
);


// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function() {
//     console.log("Connection Successful!");
//     app.listen(HTTP_PORT, () => {
//         console.log("API listening on: " + HTTP_PORT);
//     });
// });
