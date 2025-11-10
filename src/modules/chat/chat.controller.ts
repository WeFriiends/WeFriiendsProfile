import { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { extractUserId, handleServiceError } from "../../utils";
import { MatchService } from "../match/match.service";

export class ChatController {
  private chatService: ChatService;
  private MatchService: MatchService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
    this.MatchService = new MatchService();
  }

  getAllChats = async (req: Request, res: Response) => {
    console.log("controller getAllChats");
    try {
      const chats = await this.chatService.getAllChats();
      return res.send(chats);
    } catch (err) {
      handleServiceError(err, "Error getAllChats");
    }
  };

  createChat = async (req: Request, res: Response) => {
    console.log("controller createChat");
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

      const hasMatch = await this.MatchService.hasMatch(userId, friendId);
      if (!hasMatch) {
        return res.status(400).send({ message: "You are not friends" });
      }
      const existingChat = await this.chatService.getChatByParticipants(
        userId,
        friendId
      );
      if (existingChat) {
        return res.status(400).send({ message: "Chat already exists" });
      }

      const newChat = await this.chatService.createChat(userId, friendId);
      return res.send(newChat);
    } catch (err) {
      handleServiceError(err, "Error createChat");
    }
  };

  getChatById = async (req: Request, res: Response) => {
    console.log("controller getChatById");
    try {
      const chat = await this.chatService.getChatById(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      return res.send(chat);
    } catch (err) {
      handleServiceError(err, "Error getChatById");
    }
  };

  updateChat = async (req: Request, res: Response) => {
    console.log("controller updateChat");
    try {
      const chat = await this.chatService.updateChat(req.params.id, req.body);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      return res.send(chat);
    } catch (err) {
      handleServiceError(err, "Error updateChat");
    }
  };

  deleteChat = async (req: Request, res: Response) => {
    console.log("controller deleteChat");
    try {
      const chat = await this.chatService.deleteChat(req.params.id);
      if (!chat) {
        return res.status(404).send({ message: "Chat not found" });
      }
      return res.send({ message: "Chat deleted" });
    } catch (err) {
      handleServiceError(err, "Error deleteChat");
    }
  };
}
