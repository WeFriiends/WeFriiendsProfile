import { Request, Response } from "express";
import { ChatService } from "./chat.service";

export class ChatController {
  private chatService: ChatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  getAllChats = async (req: Request, res: Response) => {
    try {
      const chats = await this.chatService.getAllChats();
      res.send(chats);
    } catch (err) {
      res.status(500).send(err);
    }
  };

  createChat = async (req: Request, res: Response) => {
    try {
      const newChat = await this.chatService.createChat(req.body);
      res.send(newChat);
    } catch (err) {
      res.status(400).send(err);
    }
  };

  getChatById = async (req: Request, res: Response) => {
    try {
      const chat = await this.chatService.getChatById(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      res.send(chat);
    } catch (err) {
      res.status(500).send(err);
    }
  };

  updateChat = async (req: Request, res: Response) => {
    try {
      const chat = await this.chatService.updateChat(req.params.id, req.body);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      res.send(chat);
    } catch (err) {
      res.status(400).send(err);
    }
  };

  deleteChat = async (req: Request, res: Response) => {
    try {
      const chat = await this.chatService.deleteChat(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      res.send({ message: "Chat deleted" });
    } catch (err) {
      res.status(500).send(err);
    }
  };
}
