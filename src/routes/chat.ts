import { Express, Request, Response } from "express";
import Chat from "../models/chat";

export default (app: Express) => {
  app.get("/chats", async (req: Request, res: Response) => {
    try {
      const chats = await Chat.find();
      res.send(chats);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.post("/chats", async (req: Request, res: Response) => {
    try {
      const newChat = new Chat(req.body);
      await newChat.save();
      res.send(newChat);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  app.get("/chats/:id", async (req: Request, res: Response) => {
    try {
      const chat = await Chat.findById(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      res.send(chat);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.put("/chats/:id", async (req: Request, res: Response) => {
    try {
      const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      res.send(chat);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  app.delete("/chats/:id", async (req: Request, res: Response) => {
    try {
      const chat = await Chat.findByIdAndDelete(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      res.send({ message: "Chat deleted" });
    } catch (err) {
      res.status(500).send(err);
    }
  });
};
