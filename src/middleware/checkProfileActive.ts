import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../modules/profile/profile.service";
import { DeletionStatus } from "../modules/profile/profile.model";
import { extractUserId } from "../utils";

const profileService = new ProfileService();

export const checkProfileActive = async (req: Request, res: Response, next: NextFunction) => {
    const userId = extractUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const profile = await profileService.getProfileById(userId);
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        if (profile.deletionStatus !== DeletionStatus.ACTIVE) {
            return res.status(403).json({ 
                code: "ACCOUNT_DELETED", 
                message: "Access denied: Your account is deleted or pending deletion" 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Failed to check profile status" });
    }
};