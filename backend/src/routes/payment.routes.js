import express from "express";
import { createPayment, verifyPayment } from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";  // ✅ اضافه کن

const router = express.Router();

router.post("/request", protect, createPayment);  // ✅ protect رو اضافه کن
router.get("/verify", verifyPayment);

export default router;