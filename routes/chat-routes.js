const mongoose = require("mongoose");
const Chat = mongoose.model("Chat");

module.exports = app => {
  app.get("/chats", async (req, res) => {
    const chats = await Chat.find();
    res.send(chats);
  });

  app.post("/chats", async (req, res) => {
    const newChat = new Chat(req.body);
    await newChat.save();
    res.send(newChat);
  });

  app.get("/chats/:id", async (req, res) => {
    const chat = await Chat.findById(req.params.id);
    res.send(chat);
  });

  app.put("/chats/:id", async (req, res) => {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(chat);
  });

  app.delete("/chats/:id", async (req, res) => {
    await Chat.findByIdAndDelete(req.params.id);
    res.send({ message: "Chat deleted" });
  });
};
