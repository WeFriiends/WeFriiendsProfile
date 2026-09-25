import { NextFunction, Request, Response } from "express";
import { DeletionStatus, Profile } from "../models";

type AuthenticatedRequest = Request & {
  auth?: {
    sub?: string;
  };
};

export const requireActiveProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).auth?.sub;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  try {
    const profile = await Profile.findById(userId).exec();

    if (!profile) {
      res.status(404).json({ message: "Your Profile not found" });
      return;
    }

    if (profile.deletionStatus !== DeletionStatus.ACTIVE) {
      res.status(403).json({ message: "Access denied: Your account is deleted" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};