import express from "express";
import { chatWithGemini } from "../controllers/chatController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, chatWithGemini);

export default router;
