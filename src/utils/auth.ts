import {Request} from "express";
import {jwtDecode} from "jwt-decode";

export const extractUserId = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return null;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    return decodedToken.sub || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
