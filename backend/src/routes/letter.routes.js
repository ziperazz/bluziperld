import express from "express";
import multer from "multer";
import {
    getLetters,
    getLetterBySlug,
    createLetter,
    updateLetter,
    deleteLetter,
} from "../controllers/letter.controller.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

// گرفتن همه نامه‌ها + فیلتر + سرچ
router.get("/", getLetters);

// گرفتن نامه با slug
router.get("/slug/:slug", getLetterBySlug);

// ایجاد نامه جدید
router.post("/", upload.array("images"), createLetter);

// ویرایش نامه
router.put("/:id", upload.array("images"), updateLetter);

// حذف نامه
router.delete("/:id", deleteLetter);

export default router;