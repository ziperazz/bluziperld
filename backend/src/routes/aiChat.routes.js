import express from "express";
import { getOrCreateChat, sendMessage, clearChat } from "../controllers/aiChat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getOrCreateChat);
router.post("/send", protect, sendMessage);
router.delete("/clear", protect, clearChat);

export default router;