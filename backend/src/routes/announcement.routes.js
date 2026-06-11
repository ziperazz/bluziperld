import express from "express";
import Announcement from "../models/announcement.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// گرفتن اعلان فعال (عمومی)
router.get("/active", async (req, res) => {
    try {
        const announcement = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطا در دریافت اعلان" });
    }
});

// گرفتن همه اعلان‌ها (ادمین)
router.get("/", protect, async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطا در دریافت اعلان‌ها" });
    }
});

// ایجاد اعلان جدید (ادمین)
router.post("/", protect, async (req, res) => {
    try {
        const { text, backgroundColor, textColor, link, isActive } = req.body;
        
        const announcement = await Announcement.create({
            text,
            backgroundColor: backgroundColor || "#0f172a",
            textColor: textColor || "#ffffff",
            link: link || "",
            isActive: isActive !== undefined ? isActive : true
        });

        res.json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطا در ایجاد اعلان" });
    }
});

// آپدیت اعلان (ادمین)
router.put("/:id", protect, async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطا در بروزرسانی اعلان" });
    }
});

// حذف اعلان (ادمین)
router.delete("/:id", protect, async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "اعلان حذف شد" });
    } catch (error) {
        res.status(500).json({ success: false, message: "خطا در حذف اعلان" });
    }
});

export default router;