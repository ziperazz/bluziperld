import express from "express";
import {
    createTicket,
    getMyTickets,
    getTicketById,
    addMessageToTicket,
    getAllTicketsAdmin,
    updateTicketStatus,
} from "../controllers/ticket.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ایجاد تیکت جدید (کاربر لاگین شده)
router.post("/", protect, createTicket);

// دریافت تیکت‌های کاربر جاری
router.get("/me", protect, getMyTickets);

// دریافت تمام تیکت‌ها توسط ادمین
router.get("/admin/all", protect, authorize("admin"), getAllTicketsAdmin);

// تغییر وضعیت تیکت توسط ادمین
router.patch("/admin/:id/status", protect, authorize("admin"), updateTicketStatus);

// دریافت جزئیات یک تیکت (مالک یا ادمین)
router.get("/:id", protect, getTicketById);

// ارسال پیام جدید در تیکت (مالک یا ادمین)
router.post("/:id/messages", protect, addMessageToTicket);

export default router;
