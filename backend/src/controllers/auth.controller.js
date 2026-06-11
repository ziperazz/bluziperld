import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";

/* ==================================================
   🧩 Generate Access & Refresh Tokens
================================================== */
const createTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

/* ==================================================
   📝 Register
================================================== */
export const register = async (req, res) => {
    try {
        const { mobile, password, name } = req.body;

        // IP کاربر را بگیر
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "";

        const ALLOWED_IPS = [
            "5.215.204.177",
            "::1",
            "127.0.0.1"
        ];
        ; // جایگزین IP لپ‌تاپ خودت کن

        // شمارش تعداد ثبت‌نام‌های انجام شده روی این IP
        const count = await User.countDocuments({ registeredIP: ip });

        if (!ALLOWED_IPS.includes(ip) && count >= 1) {
            return res.status(403).json({
                success: false,
                message: "فقط یک بار ثبت‌نام مجاز است به ازای هر دستگاه",
            });
        }

        if (!mobile || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "تمام فیلدها الزامی است",
            });
        }

        const exists = await User.findOne({ mobile });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "این شماره قبلاً ثبت شده",
            });
        }

        const newUser = await User.create({
            mobile,
            password,
            name,
            registeredIP: ip,  // ذخیره IP
        });

        // ثبت فعالیت در Activity Feed
        await logActivity(
            `کاربر جدید ثبت شد: ${newUser.name} (${newUser.mobile})`,
            "user"
        );

        return res.status(201).json({
            success: true,
            message: "ثبت‌نام با موفقیت انجام شد",
        });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({
            success: false,
            message: "خطای سرور",
        });
    }
};



/* ==================================================
   🔐 Login
================================================== */
export const login = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "تمام فیلدها الزامی است",
            });
        }

        const user = await User.findOne({ mobile }).select(
            "+password +refreshToken"
        );

        if (!user)
            return res.status(404).json({
                success: false,
                message: "کاربر یافت نشد",
            });

        const isMatch = await user.comparePassword(password);

        if (!isMatch)
            return res.status(401).json({
                success: false,
                message: "رمز عبور یا شماره موبایل اشتباه است",
            });

        // create tokens
        const { accessToken, refreshToken } = createTokens(user);

        // save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // send refresh token via httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                mobile: user.mobile,
                name: user.name,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ success: false, message: "خطای سرور" });
    }
};

/* ==================================================
   🔁 Refresh access token
================================================== */
export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token)
            return res.status(401).json({
                success: false,
                message: "رفرش توکن یافت نشد",
            });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id).select("+refreshToken");

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({
                success: false,
                message: "توکن نامعتبر است",
            });
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return res.json({
            success: true,
            accessToken,
        });
    } catch (err) {
        console.error("REFRESH TOKEN ERROR:", err);
        return res.status(403).json({
            success: false,
            message: "توکن نامعتبر یا منقضی شده است",
        });
    }
};

/* ==================================================
   🚪 Logout
================================================== */
export const logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;

        if (token) {
            const user = await User.findOne({ refreshToken: token }).select(
                "+refreshToken"
            );

            if (user) {
                user.refreshToken = null;
                await user.save({ validateBeforeSave: false });
            }
        }

        res.clearCookie("refreshToken");

        return res.json({
            success: true,
            message: "خروج موفق",
        });
    } catch (err) {
        console.error("LOGOUT ERROR:", err);
        res.status(500).json({ success: false, message: "خطای سرور" });
    }
};

/* ==================================================
   👤 Get Me
================================================== */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "کاربر یافت نشد",
            });
        }

        return res.json({
            success: true,
            user,
        });
    } catch (err) {
        console.error("GET ME ERROR:", err);
        res.status(500).json({ success: false, message: "خطای سرور" });
    }
};

/* ==================================================
   📱 Forgot Password
================================================== */
export const forgotPassword = async (req, res) => {
    try {
        const { mobile, name } = req.body;

        const user = await User.findOne({ mobile, name }).select(
            "+resetPasswordToken +resetPasswordExpires"
        );

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "کاربری با این اطلاعات یافت نشد." });
        }

        const resetToken = user.createPasswordResetToken();

        await user.save({ validateBeforeSave: false });

        const resetURL = `/reset-password/${resetToken}`;

        res.json({
            success: true,
            message: "کد بازیابی تولید شد",
            resetURL,
        });
    } catch (err) {
        console.error("FORGOT PASSWORD ERROR:", err);
        res.status(500).json({ success: false, message: "خطای سرور" });
    }
};

/* ==================================================
   🔄 Reset Password
================================================== */
export const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        }).select("+resetPasswordToken +resetPasswordExpires +password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "توکن نامعتبر یا منقضی شده است.",
            });
        }

        user.password = req.body.password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.json({
            success: true,
            message: "رمز با موفقیت تغییر کرد.",
        });
    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);
        res.status(500).json({ success: false, message: "خطای سرور" });
    }
};
