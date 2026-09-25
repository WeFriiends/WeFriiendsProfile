import {Request} from "express";
import {jwtDecode} from "jwt-decode";

export const extractUserId = (req: Request): string => {
  const userId = req.auth?.sub;

  if (!userId) {
    throw new Error("Unauthorized: User ID missing from request context");
  }

  return userId;
};
