import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        mobile: {
            type: String,
            required: [true, "شماره موبایل الزامی است"],
            unique: true,
            trim: true,
            match: [/^09[0-9]{9}$/, "شماره موبایل معتبر نیست"],
        },

        password: {
            type: String,
            required: [true, "رمز عبور الزامی است"],
            minlength: [6, "رمز عبور باید حداقل 6 کاراکتر باشد"],
            select: false,
        },

        name: {
            type: String,
            required: [true, "نام الزامی است"],
            trim: true,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        refreshToken: {
            type: String,
            default: null,
            select: false,
        },

        resetPasswordToken: {
            type: String,
            default: null,
            select: false,
        },
        registeredIP: { type: String },

        resetPasswordExpires: {
            type: Date,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

/* =========================================
   🔐 Hash Password Before Save
========================================= */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 12);
});

/* =========================================
   🔑 Compare Password
========================================= */
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

/* =========================================
   ♻ Generate Reset Password Token
========================================= */
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
