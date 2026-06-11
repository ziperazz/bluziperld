import Discount from "../models/discount.js";

// ساخت کد تخفیف
export const createDiscount = async (req, res) => {
    try {
        const { code, type, value, minOrderAmount, maxUses, expiresAt, description } = req.body;

        if (!code || !type || !value) {
            return res.status(400).json({ message: "کد، نوع و مقدار الزامی است" });
        }

        const exists = await Discount.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.status(400).json({ message: "این کد تخفیف قبلاً ثبت شده" });
        }

        const discount = await Discount.create({
            code: code.toUpperCase(),
            type,
            value,
            minOrderAmount,
            maxUses,
            expiresAt,
            description
        });

        res.status(201).json({ success: true, discount });
    } catch (error) {
        res.status(500).json({ message: "خطا در ساخت کد تخفیف" });
    }
};

// دریافت همه کدهای تخفیف
export const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ message: "خطا در دریافت کدهای تخفیف" });
    }
};

// حذف کد تخفیف
export const deleteDiscount = async (req, res) => {
    try {
        await Discount.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "کد تخفیف حذف شد" });
    } catch (error) {
        res.status(500).json({ message: "خطا در حذف کد تخفیف" });
    }
};

// اعتبارسنجی کد تخفیف (برای فرانت)
export const validateDiscount = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        const discount = await Discount.findOne({ 
            code: code.toUpperCase(),
            isActive: true
        });

        if (!discount) {
            return res.status(404).json({ message: "کد تخفیف معتبر نیست" });
        }

        // چک تاریخ انقضا
        if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
            return res.status(400).json({ message: "کد تخفیف منقضی شده" });
        }

        // چک حداکثر استفاده
        if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) {
            return res.status(400).json({ message: "ظرفیت کد تخفیف تکمیل شده" });
        }

        // چک حداقل سفارش
        if (orderAmount && orderAmount < discount.minOrderAmount) {
            return res.status(400).json({ 
                message: `حداقل مبلغ سفارش ${discount.minOrderAmount.toLocaleString()} تومان است` 
            });
        }

        let discountAmount = 0;
        if (discount.type === "percent") {
            discountAmount = (orderAmount * discount.value) / 100;
        } else {
            discountAmount = Math.min(discount.value, orderAmount);
        }

        res.json({
            success: true,
            discount: {
                _id: discount._id,
                code: discount.code,
                type: discount.type,
                value: discount.value,
                discountAmount: Math.floor(discountAmount),
                description: discount.description
            }
        });
    } catch (error) {
        res.status(500).json({ message: "خطا در بررسی کد تخفیف" });
    }
};