import Transaction from "../models/transaction.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Letter from "../models/Letter.js";

const MERCHANT = "b28716b2-c50b-43cd-8e21-2d3951aaf1d0";
const requestURL = "https://api.zarinpal.com/pg/v4/payment/request.json";
const verifyURL  = "https://api.zarinpal.com/pg/v4/payment/verify.json";
const startPayURL = "https://payment.zarinpal.com/pg/StartPay/";

const getModelByType = (type) => (type === "letter" ? Letter : Product);

export const createPayment = async (req, res) => {
    try {
        let { amount, orderId, mobile, email, cart, shipping, subtotal, shippingCost, total } = req.body;

        amount = Number(amount) * 10;

        if (!amount || amount < 10000) {
            return res.status(400).json({
                success: false,
                message: "مبلغ باید حداقل 1000 تومان باشد"
            });
        }

        const callback_url = process.env.ZARINPAL_CALLBACK_URL || "https://bluziperld.ir/payment/verify";

        const response = await fetch(requestURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                merchant_id: MERCHANT,
                amount: amount,
                callback_url,
                description: `پرداخت سفارش ${orderId || "نامشخص"}`,
                metadata: {
                    mobile: mobile || "09120000000",
                    email: email || "info@bluziperld.ir"
                }
            })
        });

        const data = await response.json();

        if (data.data && data.data.authority) {
            const authority = data.data.authority;

            await Transaction.create({
    authority,
    orderId,
    amount: Number(req.body.amount),
    status: "pending",
    user: req.user?._id || null,  // ✅ این خط رو اضافه کن
    meta: {
        cart: cart || [],
        shipping: shipping || {},
        subtotal: subtotal || Number(req.body.amount),
        shippingCost: shippingCost || 0,
        total: total || Number(req.body.amount) + (shippingCost || 0),
    }
});
            return res.json({
                success: true,
                url: `${startPayURL}${authority}`,
                authority
            });
        }

        return res.status(400).json({
            success: false,
            message: "خطا در تایید هویت درگاه (Authority)",
            errors: data.errors
        });

    } catch (error) {
        console.error("Critical Payment Error:", error);
        res.status(500).json({ success: false, message: "خطای سرور در ایجاد پرداخت" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { Authority, Status } = req.query;

        if (Status !== "OK" || !Authority) {
            return res.status(400).json({ success: false, message: "پرداخت انجام نشد" });
        }

        const transaction = await Transaction.findOne({ authority: Authority });
        if (!transaction) {
            return res.status(404).json({ success: false, message: "تراکنش یافت نشد" });
        }

        if (transaction.status === "paid") {
            return res.json({
                success: true,
                refId: transaction.refId,
                orderId: transaction.orderId,
                amount: transaction.amount
            });
        }

        const amountInRial = Number(transaction.amount) * 10;

        const response = await fetch(verifyURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                merchant_id: MERCHANT,
                authority: Authority,
                amount: amountInRial
            })
        });

        const data = await response.json();

        if (data.data && (data.data.code === 100 || data.data.code === 101)) {
            transaction.status = "paid";
            transaction.refId = data.data.ref_id;
            await transaction.save();

            // ✅ ثبت سفارش
            let order = null;
            try {
                const meta = transaction.meta || {};
                const cart = meta.cart || [];
                const shipping = meta.shipping || {};

                if (cart.length > 0) {
                    const trackingCode = "BLZ-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();

                    order = await Order.create({
                        trackingCode,
                        user: transaction.user || null,
                        cart: cart.map(item => ({
                            productId: item.productId,
                            productType: item.productType || "product",
                            title: item.title || "",
                            price: Number(item.price) || 0,
                            quantity: Number(item.quantity) || 1,
                            image: item.image || "",
                            writingType: item.writingType || null,
                            letterText: item.letterText || null,
                        })),
                        shipping: {
                            fullName: shipping.fullName || "",
                            phone: shipping.phone || "",
                            address: shipping.address || "",
                            province: shipping.province || "",
                            city: shipping.city || "",
                            postalCode: shipping.postalCode || "",
                            shippingMethod: shipping.shippingMethod || "",
                            shippingPrice: shipping.shippingPrice || 0,
                            note: shipping.note || "",
                        },
                        subtotal: meta.subtotal || transaction.amount,
                        shippingCost: meta.shippingCost || 0,
                        total: meta.total || transaction.amount,
                        fakeOrderIdFromGateway: data.data.ref_id,
                        status: "AWAITING_ADMIN_REVIEW",
                    });

                    for (const item of cart) {
                        try {
                            const Model = getModelByType(item.productType || "product");
                            await Model.findByIdAndUpdate(item.productId, {
                                $inc: {
                                    purchaseCount: item.quantity || 1,
                                    instock: -(item.quantity || 1),
                                },
                            });
                        } catch (e) {}
                    }
                }
            } catch (e) {
                console.error("Order creation error:", e);
            }

            return res.json({
                success: true,
                refId: data.data.ref_id,
                orderId: order?._id || transaction.orderId,
                amount: transaction.amount
            });
        }

        transaction.status = "failed";
        await transaction.save();

        return res.status(400).json({
            success: false,
            message: "تاییدیه پرداخت ناموفق بود",
            code: data.data?.code
        });

    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ success: false, message: "خطا در تایید تراکنش" });
    }
};