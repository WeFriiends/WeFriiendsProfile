import { Router } from "express";
import { BlockController } from "./block.controller";
import { checkJwt } from "../../middleware";

const router = Router();
const blockController = new BlockController();

router.post("/", checkJwt, blockController.blockUser);

export default router;
