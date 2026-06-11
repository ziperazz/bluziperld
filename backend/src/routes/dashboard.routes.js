import express from "express";
import {
    getDashboardStats,
    getTopProducts,
    getSalesChart,
} from "../controllers/dashboard.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// آمار کلی داشبورد
router.get("/stats", protect, authorize("admin"), getDashboardStats);

// پرفروش‌ترین محصولات
router.get("/products/top", protect, authorize("admin"), getTopProducts);

// نمودار فروش
router.get("/sales/chart", protect, authorize("admin"), getSalesChart);

export default router;
