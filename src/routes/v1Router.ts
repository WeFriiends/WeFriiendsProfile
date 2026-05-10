import express from "express";
import profileRoutes from "../modules/profile/profile.route";
import photosRoutes from "../modules/photo/photo.route";
import chatsRoutes from "../modules/chat/chat.route";
import dislikesRoutes from "../modules/dislike/dislike.route";
import matchRoutes from "../modules/match/match.route";
import likesRoutes from "../modules/like/like.route";
import blockRoutes from "../modules/block/block.route";
import reportRoutes from "../modules/report/report.route";

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/dislikes", dislikesRoutes);
router.use("/matches", matchRoutes);
router.use("/likes", likesRoutes);
router.use("/photos", photosRoutes);
router.use("/chats", chatsRoutes);
router.use("/block", blockRoutes);
router.use("/report", reportRoutes);

export default router;
