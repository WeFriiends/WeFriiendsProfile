import { Router } from "express";
import { BlockController } from "./block.controller";
import { checkJwt } from "../../middleware";

const router = Router();
const blockController = new BlockController();

/**
 * POST /api/block
 * Block a user: removes match, adds to blackList.
 * blockerUserId is taken from the JWT.
 */
router.post("/", checkJwt, blockController.blockUser);

export default router;
