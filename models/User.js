const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: String,
  avatar: String,
  name: String,
  age: String,
  lastMessage: String,
  messageCount: String
});

mongoose.model("User", userSchema);
