import { Express, Request, Response } from "express";
import User from "../models/user";

export default (app: Express) => {
  app.get("/users", async (req: Request, res: Response) => {
    try {
      const users = await User.find();
      res.send(users);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post("/users", async (req: Request, res: Response) => {
    try {
      const newUser = new User(req.body);
      await newUser.save();
      res.send(newUser);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  app.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send(user);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.put("/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send({ message: "User deleted" });
    } catch (err) {
      res.status(500).send(err);
    }
  });
};
