import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";

import {
   createComment,
   getCommentsByProduct,
   likeComment,
   dislikeComment,
   getPendingComments,
   approveComment,
   deleteComment,
   getLatestComments,
   getCommentsByLetter,
} from "../controllers/comment.controller.js";

const router = express.Router();

/* ===========================
   User Routes
=========================== */

// ساخت کامنت یا ریپلای (فقط کاربران لاگین)
router.post("/", protect, createComment);

// گرفتن کامنت‌های تایید شده یک محصول (عمومی)
router.get("/product/:productId", getCommentsByProduct);

// لایک
router.post("/:id/like", protect, likeComment);

// دیسلایک
router.post("/:id/dislike", protect, dislikeComment);

// آخرین کامنت‌ها (عمومی)
router.get("/latest", getLatestComments);

router.get("/letter/:letterId", getCommentsByLetter);


/* ===========================
   Admin Routes
=========================== */

// گرفتن کامنت‌های تایید نشده برای بررسی ادمین
router.get("/admin/pending", protect, authorize("admin"), getPendingComments);

// تایید کامنت
router.patch("/admin/:id/approve", protect, authorize("admin"), approveComment);

// حذف کامنت (مثلاً رد کامنت)
router.delete("/admin/:id", protect, authorize("admin"), deleteComment);

export default router;
