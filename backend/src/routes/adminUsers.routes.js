import express from "express";

import {
    getUsers,
    deleteUser,
    getUserOrders,
} from "../controllers/adminUsers.controller.js";

import {
    protect,
    authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =================================
   Admin Routes
================================= */

// لیست کاربران
router.get("/", protect, authorize("admin"), getUsers);

// سفارش‌های یک کاربر
router.get(
    "/:userId/orders",
    protect,
    authorize("admin"),
    getUserOrders
);

// حذف کاربر
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteUser
);

export default router;
