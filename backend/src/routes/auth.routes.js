import express from "express";
import {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================================
   🔐 Auth Routes
========================================= */

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);

/* =========================================
   👤 User
========================================= */

router.get("/me", protect, getMe);

/* =========================================
   🔑 Password Recovery
========================================= */

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
