import express from "express";
import profileRoutes from "../modules/profile/profile.route";
import photosRoutes from "../modules/photo/photo.route";
import chatsRoutes from "../modules/chat/chat.route";
import dislikesRoutes from "../modules/deslikes/dislikes.route";
import matchRoutes from "../modules/match/match.route";
import likesRoutes from "../modules/likes/likes.route";

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/dislikes", dislikesRoutes);
router.use("/matches", matchRoutes);
router.use("/likes", likesRoutes);
router.use("/photos", photosRoutes);
router.use("/chats", chatsRoutes);

export default router;
