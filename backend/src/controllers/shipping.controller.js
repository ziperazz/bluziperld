import Shipping from "../models/shipping.js";
import jwt from "jsonwebtoken";

export const createShipping = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "توکن ارسال نشده است" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const {
            fullName,
            phone,
            province,
            city,
            address,
            postalCode,
            shippingMethod,
            note
        } = req.body;

        if (!fullName || !phone || !province || !city || !address || !postalCode || !shippingMethod) {
            return res.status(400).json({ message: "لطفاً تمام فیلدهای ضروری را کامل وارد کنید" });
        }

        const newShipping = new Shipping({
            userId,
            fullName,
            phone,
            province,
            city,
            address,
            postalCode,
            shippingMethod,
            note
        });

        await newShipping.save();

        return res.status(201).json({
            message: "اطلاعات ارسال با موفقیت ذخیره شد",
            shipping: newShipping
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "خطا در ذخیره اطلاعات ارسال" });
    }
};
