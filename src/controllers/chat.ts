import { Request, Response } from "express";
import Chat from "../models/chat";

export const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find();
    res.send(chats);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const newChat = new Chat(req.body);
    await newChat.save();
    res.send(newChat);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getChatById = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).send({ message: "Chat not found" });
    }
    res.send(chat);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const updateChat = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chat) {
      return res.status(404).send({ message: "Chat not found" });
    }
    res.send(chat);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) {
      return res.status(404).send({ message: "Chat not found" });
    }
    res.send({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).send(err);
  }
};
