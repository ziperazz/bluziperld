import Comment from "../models/comment.model.js";

/* ------------------- ساخت کامنت یا ریپلای ------------------- */
export const createComment = async (req, res) => {
    try {
        const {
            targetId,
            targetType,
            content,
            rating,
            parent,
        } = req.body;


        if (!content || !targetId || !targetType)
            return res.status(400).json({ message: "مقادیر لازم ارسال نشده" });

        // بررسی خریداری بودن کاربر (فقط برای محصولات)
        let isBuyer = false;

        if (targetType === "Product") {
            isBuyer = req.user.purchasedProducts?.includes(targetId) || false;
        }

        const newComment = await Comment.create({
            targetId,
            targetType,
            user: req.user._id,
            content,
            rating,
            parent: parent || null,
            isBuyer,
            approved: false, // کامنت در ابتدا تایید نشده
        });

        if (parent) {
            await Comment.findByIdAndUpdate(parent, {
                $push: { replies: newComment._id },
            });
        }

        return res.status(201).json({
            message: "نظر شما ثبت شد و پس از تایید مدیر منتشر می‌شود.",
            comment: newComment,
        });
    } catch (err) {
        console.error("ERR createComment:", err);
        return res.status(500).json({ message: "خطا در ثبت نظر" });
    }
};

/* ------------------- گرفتن کامنت‌های تایید شده محصول ------------------- */
export const getCommentsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        let comments = await Comment.find({
            targetId: productId,
            targetType: "Product",
            approved: true,
            parent: null,
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "name")
            .populate({
                path: "replies",
                match: { approved: true },
                populate: { path: "user", select: "name" },
            });
        comments = comments.filter(c => c.user !== null);
        return res.json(comments);
    } catch (err) {
        console.error("ERR getCommentsByProduct:", err);
        return res.status(500).json({ message: "خطا در دریافت نظرات" });
    }
};

/* ------------------- لایک ------------------- */
export const likeComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const commentId = req.params.id;

        const updated = await Comment.findByIdAndUpdate(
            commentId,
            {
                $addToSet: { likes: userId },
                $pull: { dislikes: userId },
            },
            { new: true }
        );

        return res.json(updated);
    } catch (err) {
        console.error("ERR likeComment:", err);
        return res.status(500).json({ message: "خطا در لایک" });
    }
};

/* ------------------- دیسلایک ------------------- */
export const dislikeComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const commentId = req.params.id;

        const updated = await Comment.findByIdAndUpdate(
            commentId,
            {
                $addToSet: { dislikes: userId },
                $pull: { likes: userId },
            },
            { new: true }
        );

        return res.json(updated);
    } catch (err) {
        console.error("ERR dislikeComment:", err);
        return res.status(500).json({ message: "خطا در دیسلایک" });
    }
};

/* ============================================================
   🧩 قابلیت‌های جدید برای پنل ادمین
   ============================================================ */

/* --- دریافت کامنت‌های تایید نشده برای بررسی --- */
export const getPendingComments = async (req, res) => {
    try {
        const pending = await Comment.find({ approved: false })
            .sort({ createdAt: -1 })
            .populate("user", "name email")
            .populate("targetId", "title");


        return res.json(pending);
    } catch (err) {
        console.error("ERR getPendingComments:", err);
        return res.status(500).json({ message: "خطا در دریافت کامنت‌های تایید نشده" });
    }
};

/* --- تایید کامنت توسط ادمین --- */
export const approveComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findByIdAndUpdate(
            id,
            { approved: true },
            { new: true }
        )
            .populate("user", "name email")
            .populate("targetId", "title");


        if (!comment)
            return res.status(404).json({ message: "کامنت پیدا نشد" });

        return res.json({ message: "کامنت تایید شد", comment });
    } catch (err) {
        console.error("ERR approveComment:", err);
        return res.status(500).json({ message: "خطا در تایید کامنت" });
    }
};

/* --- حذف کامنت (در صورت رد توسط ادمین) --- */
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Comment.findByIdAndDelete(id);

        if (!deleted)
            return res.status(404).json({ message: "کامنت پیدا نشد" });

        return res.json({ message: "کامنت حذف شد (رد شد)." });
    } catch (err) {
        console.error("ERR deleteComment:", err);
        return res.status(500).json({ message: "خطا در حذف کامنت" });
    }
};
/* ------------------- گرفتن آخرین کامنت‌های تایید شده (برای صفحه اصلی) ------------------- */
export const getLatestComments = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;

        const comments = await Comment.find({

            approved: true,
            parent: null
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("user", "name");

        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت نظرات" });
    }
};

export const getCommentsByLetter = async (req, res) => {
    try {
        const { letterId } = req.params;

        const comments = await Comment.find({
            targetId: letterId,
            targetType: "Letter",
            approved: true,
            parent: null,
        })
            .populate("user", "name")
            .populate({
                path: "replies",
                match: { approved: true },
                populate: {
                    path: "user",
                    select: "name",
                },
            })
            .sort({ createdAt: -1 });

        const filtered = comments.filter((c) => c.user !== null);

        res.json(filtered);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
