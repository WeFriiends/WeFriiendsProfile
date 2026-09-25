import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      cloudinaryUrls?: string[];
      auth?: {
        sub: string;
        [key: string]: any;
      };
    }
  }
}

export {};