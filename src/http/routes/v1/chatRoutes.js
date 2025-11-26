import { Router } from "express";
import { chatController } from "../../controllers/chatController.js";

const router = Router();

router.post("/", chatController.start);
router.post("/message", chatController.message);

export const chatRouter = router;
