import { Router } from "express";
import { BlockController } from "./block.controller";

const router = Router();
const blockController = new BlockController();

/**
 * POST /api/block
 * Block a user: removes match & chat, adds to blackList
 */
router.post("/", blockController.blockUser);

export default router;
