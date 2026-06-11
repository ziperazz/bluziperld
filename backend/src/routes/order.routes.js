import express from "express";
import {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePostTrackingCode
} from "../controllers/order.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ---------- Public ---------- */
router.get("/test-no-auth", (req, res) => {
    res.json({ message: "ORDER ROUTE بدون نیاز به توکن فعال است" });
});

/* ---------- User Routes ---------- */
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

/* ---------- Admin Routes ---------- */
router.get("/", protect, authorize("admin"), getAllOrders);
router.patch("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/tracking", protect, authorize("admin"), updatePostTrackingCode);  // 🆕

/* ---------- Get order by ID ---------- */
router.get("/:id", protect, getOrderById);

export default router;