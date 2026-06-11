import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Letter from "../models/Letter.js";
import { generateTrackingCode } from "../utils/generateTrackingCode.js";

/* =========================
   Helper
========================= */

const getModelByType = (type) => {
    return type === "letter" ? Letter : Product;
};

/* =========================
   🟢 CREATE ORDER
========================= */

export const createOrder = async (req, res) => {
    try {
        const {
            cart,
            shipping,
            subtotal,
            shippingCost,
            total,
            fakeOrderIdFromGateway,
        } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "ابتدا وارد حساب کاربری شوید.",
            });
        }

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "سبد خرید خالی است",
            });
        }

        console.log("🟢 RECEIVED CART:", cart);

        for (const item of cart) {
            const productId =
                typeof item.productId === "object"
                    ? item.productId._id
                    : item.productId;

            const Model = getModelByType(item.productType || "product");
            const product = await Model.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "محصول پیدا نشد",
                });
            }

            if ((product.instock || 0) < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `محصول «${product.title}» فقط ${product.instock} عدد موجود است`,
                });
            }
        }

        const sanitizedCart = cart.map((item) => ({
            productId:
                typeof item.productId === "object"
                    ? item.productId._id
                    : item.productId,
            productType: item.productType || "product",
            title: item.title || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.image || "",
            writingType: item.writingType || null,
            letterText: item.letterText || null,
        }));

        const sanitizedShipping = {
            fullName: shipping.fullName || "",
            phone: shipping.phone || "",
            address: shipping.address || "",
            province: shipping.province || "",
            city: shipping.city || "",
            postalCode: shipping.postalCode || "",
            shippingMethod: shipping.shippingMethod || "",
            shippingPrice: shipping.shippingPrice || 0,
            note: shipping.note || "",
        };

        const trackingCode = generateTrackingCode();

        const order = await Order.create({
            trackingCode,
            user: req.user._id,
            cart: sanitizedCart,
            shipping: sanitizedShipping,
            subtotal,
            shippingCost,
            total,
            fakeOrderIdFromGateway,
            status: "AWAITING_ADMIN_REVIEW",
        });

        for (const item of sanitizedCart) {
            const Model = getModelByType(item.productType);
            await Model.findByIdAndUpdate(item.productId, {
                $inc: {
                    purchaseCount: item.quantity,
                    instock: -item.quantity,
                },
            });
        }

        return res.status(201).json({
            success: true,
            message: "سفارش با موفقیت ثبت شد",
            order,
        });
    } catch (error) {
        console.error("❌ CREATE ORDER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در ثبت سفارش",
        });
    }
};

/* =========================
   🟢 USER ORDERS
========================= */

export const getMyOrders = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "احراز هویت انجام نشده است.",
            });
        }

        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("GET MY ORDERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت سفارش‌ها",
        });
    }
};

/* =========================
   🟠 ADMIN - ALL ORDERS
========================= */

export const getAllOrders = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "دسترسی غیرمجاز. فقط مدیران می‌توانند همه سفارش‌ها را مشاهده کنند.",
            });
        }

        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.find()
            .populate("user", "name mobile")
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("getAllOrders error:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت سفارش‌ها",
            error: error.message,
        });
    }
};

/* =========================
   🟢 GET ORDER BY ID
========================= */

export const getOrderById = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "احراز هویت انجام نشده است.",
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "سفارش پیدا نشد",
            });
        }

        if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "دسترسی ندارید. این سفارش متعلق به شما نیست.",
            });
        }

        return res.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("GET ORDER BY ID ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت سفارش",
        });
    }
};

/* =========================
   🟣 ADMIN - UPDATE STATUS
========================= */

export const updateOrderStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "فقط مدیر اجازه تغییر وضعیت سفارش را دارد.",
            });
        }

        const { status } = req.body;

        const allowedStatuses = [
            "PENDING_PAYMENT",
            "PAID",
            "PROCESSING",
            "AWAITING_ADMIN_REVIEW",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
            "FAILED",
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "وضعیت سفارش معتبر نیست",
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "سفارش پیدا نشد",
            });
        }

        return res.json({
            success: true,
            message: "وضعیت سفارش با موفقیت بروزرسانی شد",
            order,
        });
    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "خطا در بروزرسانی وضعیت سفارش",
        });
    }
};

// =========================
// 🆕 آپدیت کد رهگیری پست (فقط ادمین)
// =========================
export const updatePostTrackingCode = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "فقط مدیر اجازه ثبت کد رهگیری را دارد.",
            });
        }

        const { postTrackingCode } = req.body;

        if (!postTrackingCode || postTrackingCode.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "کد رهگیری نمی‌تواند خالی باشد",
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { postTrackingCode: postTrackingCode.trim() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "سفارش یافت نشد",
            });
        }

        res.json({
            success: true,
            message: "کد رهگیری با موفقیت ثبت شد",
            order,
        });
    } catch (error) {
        console.error("Update Post Tracking Error:", error);
        res.status(500).json({
            success: false,
            message: "خطا در بروزرسانی کد رهگیری",
        });
    }
};