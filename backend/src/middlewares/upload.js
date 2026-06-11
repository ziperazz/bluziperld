// src/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// مسیر ذخیره فایل‌ها (پوشه uploads)
const uploadDir = path.resolve("uploads");

// اگر پوشه وجود ندارد، بسازش
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// تنظیم نوع ذخیره
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "img-" + uniqueSuffix + ext);
    },
});

// فیلتر فقط برای تصاویر
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("فقط فایل تصویری مجاز است."), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // حداکثر 5MB
});
