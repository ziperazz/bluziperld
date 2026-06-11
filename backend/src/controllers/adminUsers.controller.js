import User from "../models/User.js"
import Order from "../models/Order.js"

/* =========================
   لیست کاربران + سرچ
========================= */
export const getUsers = async (req, res) => {
    try {

        const search = req.query.search || ""
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10

        let query = {}

        if (search) {

            // پیدا کردن سفارش هایی که trackingCode آن ها شامل سرچ است
            const orders = await Order.find({
                trackingCode: { $regex: search, $options: "i" }
            }).select("user")

            const userIdsFromOrders = orders.map(o => o.user)

            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { mobile: { $regex: search, $options: "i" } },
                    { _id: { $in: userIdsFromOrders } }
                ]
            }
        }

        const users = await User.find(query)
            .select("name mobile createdAt")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        const total = await User.countDocuments(query)

        res.json({
            success: true,
            users,
            total,
            pages: Math.ceil(total / limit),
            page
        })

    } catch (error) {

        console.error("getUsers error:", error)

        res.status(500).json({
            success: false,
            message: "خطا در دریافت کاربران",
        })
    }
}



/* =========================
   حذف کاربر
========================= */
export const deleteUser = async (req, res) => {
    try {

        const { id } = req.params

        const user = await User.findByIdAndDelete(id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "کاربر پیدا نشد",
            })
        }

        res.json({
            success: true,
            message: "کاربر حذف شد",
        })

    } catch (error) {

        console.error("deleteUser error:", error)

        res.status(500).json({
            success: false,
            message: "خطا در حذف کاربر",
        })
    }
}


/* =========================
   سفارش های یک کاربر
========================= */
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params

        const orders = await Order.find({ user: userId })
            .select("trackingCode total status createdAt")
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            orders,
        })
    } catch (error) {
        console.error("getUserOrders error:", error)

        res.status(500).json({
            success: false,
            message: "خطا در دریافت سفارش‌های کاربر",
        })
    }
}
