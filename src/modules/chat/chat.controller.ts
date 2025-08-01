import { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { extractUserId } from "../../utils";

export class ChatController {
  private chatService: ChatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  getAllChats = async (req: Request, res: Response) => {
    try {
      const chats = await this.chatService.getAllChats();
      return res.send(chats);
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  createChat = async (req: Request, res: Response) => {
    try {
      const { friendId } = req.body;
      if (!friendId) {
        return res.status(400).send({ message: "Friend ID is required" });
      }
      const userId = extractUserId(req);
      if (!userId) {
        return res.status(401).send({ message: "Unauthorized" });
      }

      if (userId === friendId) {
        return res
          .status(400)
          .send({ message: "You cannot chat with yourself" });
      }

      const newChat = await this.chatService.createChat(userId, friendId);
      return res.send(newChat);
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  getChatById = async (req: Request, res: Response) => {
    try {
      const chat = await this.chatService.getChatById(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      return res.send(chat);
    } catch (err) {
      return res.status(500).send(err);
    }
  };

  updateChat = async (req: Request, res: Response) => {
    try {
      const chat = await this.chatService.updateChat(req.params.id, req.body);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      return res.send(chat);
    } catch (err) {
      return res.status(400).send(err);
    }
  };

  deleteChat = async (req: Request, res: Response) => {
    try {
      const chat = await this.chatService.deleteChat(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      return res.send({ message: "Chat deleted" });
    } catch (err) {
      return res.status(500).send(err);
    }
  };
}
