const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chat_id: String,
  user_id: String,
  friend_id: String,
  messages: [
    {
      message_id: String,
      sender_id: String,
      timestamp: Date,
      message: String,
      read_status: Boolean
    }
  ]
});

mongoose.model("Chat", chatSchema);
