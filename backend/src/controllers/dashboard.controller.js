import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Letter from "../models/Letter.js";
import User from "../models/User.js";

const SUCCESS_STATUSES = ["PAID", "SUCCESS", "DELIVERED", "COMPLETED", "SHIPPED"];

/* ---------------- Dashboard Stats ---------------- */
export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalProducts, totalLetters, totalOrders] =
            await Promise.all([
                User.countDocuments(),
                Product.countDocuments(),
                Letter.countDocuments(),
                Order.countDocuments(),
            ]);

        const totalItems = totalProducts + totalLetters;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // درآمد امروز
        const todayAgg = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today, $lt: tomorrow },
                    status: { $in: SUCCESS_STATUSES },
                },
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total" },
                },
            },
        ]);

        const todayRevenue = todayAgg.length ? todayAgg[0].revenue : 0;

        // درآمد دیروز
        const yesterdayAgg = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: yesterday, $lt: today },
                    status: { $in: SUCCESS_STATUSES },
                },
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: "$total" },
                },
            },
        ]);

        const yesterdayRevenue = yesterdayAgg.length ? yesterdayAgg[0].revenue : 0;

        const revenueChange =
            yesterdayRevenue === 0
                ? todayRevenue > 0
                    ? 100
                    : 0
                : Math.round(
                    ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
                );

        const todayOrdersCount = await Order.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
        });

        const yesterdayOrdersCount = await Order.countDocuments({
            createdAt: { $gte: yesterday, $lt: today },
        });

        const ordersChange =
            yesterdayOrdersCount === 0
                ? todayOrdersCount > 0
                    ? 100
                    : 0
                : Math.round(
                    ((todayOrdersCount - yesterdayOrdersCount) /
                        yesterdayOrdersCount) *
                    100
                );

        const todayUsersCount = await User.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
        });

        const yesterdayUsersCount = await User.countDocuments({
            createdAt: { $gte: yesterday, $lt: today },
        });

        const usersChange =
            yesterdayUsersCount === 0
                ? todayUsersCount > 0
                    ? 100
                    : 0
                : Math.round(
                    ((todayUsersCount - yesterdayUsersCount) /
                        yesterdayUsersCount) *
                    100
                );

        const [todayProductsCount, todayLettersCount] = await Promise.all([
            Product.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Letter.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
        ]);

        const [yesterdayProductsCount, yesterdayLettersCount] = await Promise.all([
            Product.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
            Letter.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
        ]);

        const todayItemsCount = todayProductsCount + todayLettersCount;
        const yesterdayItemsCount =
            yesterdayProductsCount + yesterdayLettersCount;

        const productsChange =
            yesterdayItemsCount === 0
                ? todayItemsCount > 0
                    ? 100
                    : 0
                : Math.round(
                    ((todayItemsCount - yesterdayItemsCount) /
                        yesterdayItemsCount) *
                    100
                );

        res.json({
            success: true,
            stats: {
                todayRevenue,
                totalUsers,
                totalOrders,
                totalProducts: totalItems,
                revenueChange,
                ordersChange,
                usersChange,
                productsChange,
            },
        });
    } catch (error) {
        console.error("getDashboardStats error:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت آمار داشبورد",
            error: error.message,
        });
    }
};

/* ---------------- Top Products + Letters ---------------- */
export const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Product.find()
            .sort({ purchaseCount: -1, createdAt: -1 })
            .limit(5)
            .lean();

        const topLetters = await Letter.find()
            .sort({ purchaseCount: -1, createdAt: -1 })
            .limit(5)
            .lean();

        const merged = [
            ...topProducts.map((item) => ({
                ...item,
                itemType: "product",
            })),
            ...topLetters.map((item) => ({
                ...item,
                itemType: "letter",
            })),
        ]
            .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
            .slice(0, 5);

        const products = merged.map((item) => ({
            _id: item._id,
            title: item.title,
            price: item.price,
            purchaseCount: item.purchaseCount || 0,
            image: item.images?.[0] || null,
            itemType: item.itemType,
        }));

        res.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("getTopProducts error:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت محصولات پرفروش",
            error: error.message,
        });
    }
};

/* ---------------- Sales Chart ---------------- */
export const getSalesChart = async (req, res) => {
    try {
        let range = parseInt(req.query.range);
        if (![7, 30].includes(range)) range = 7;

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - (range - 1));

        const orders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: SUCCESS_STATUSES },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    totalSales: { $sum: "$total" },
                    ordersCount: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                },
            },
        ]);

        const chart = [];
        const weekDaysFa = [
            "یکشنبه",
            "دوشنبه",
            "سه‌شنبه",
            "چهارشنبه",
            "پنجشنبه",
            "جمعه",
            "شنبه",
        ];

        for (let i = 0; i < range; i++) {
            const current = new Date(startDate);
            current.setDate(startDate.getDate() + i);

            const year = current.getFullYear();
            const month = current.getMonth() + 1;
            const day = current.getDate();

            const found = orders.find(
                (item) =>
                    item._id.year === year &&
                    item._id.month === month &&
                    item._id.day === day
            );

            chart.push({
                label:
                    range === 7
                        ? weekDaysFa[current.getDay()]
                        : `${month}/${day}`,
                date: `${year}/${month}/${day}`,
                sales: found ? found.totalSales : 0.00001,
                orders: found ? found.ordersCount : 0,
            });
        }

        res.json({
            success: true,
            chart,
        });
    } catch (error) {
        console.error("getSalesChart error:", error);
        res.status(500).json({
            success: false,
            message: "خطا در دریافت داده‌های نمودار فروش",
            error: error.message,
        });
    }
};
