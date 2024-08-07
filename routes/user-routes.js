const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = app => {
  app.get("/users", async (req, res) => {
    const users = await User.find();
    res.send(users);
  });

  app.post("/users", async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.send(newUser);
  });

  app.get("/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    res.send(user);
  });

  app.put("/users/:id", async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(user);
  });

  app.delete("/users/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: "User deleted" });
  });
};
