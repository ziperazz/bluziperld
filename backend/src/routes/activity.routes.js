import express from "express";

import {
    getActivities,
    createActivity,
} from "../controllers/activity.controller.js";

const router = express.Router();


// دریافت فعالیت‌ها
router.get("/", getActivities);


// ثبت فعالیت
router.post("/", createActivity);


export default router;
