import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js"; // اگر پوشه models در کنار همین فایل است

dotenv.config();

const products = [
    {
        name: "پاکت‌نامه عاشقانه کلاسیک",
        description: "یک نامه فوق‌العاده احساسی با کاغذ عطری و لبه‌های سوخته، مناسب برای ابراز صمیمانه‌ترین احساسات به همراه مهر مومی قرمز.",
        price: 150000,
        images: [
            "https://picsum.photos/seed/love1/800/600",
            "https://picsum.photos/seed/love2/800/600",
            "https://picsum.photos/seed/love3/800/600"
        ],
        specs: [
            { label: "نوع کاغذ", value: "گلاسه عطری" },
            { label: "رنگ جوهر", value: "قهوه‌ای سوخته (سپیا)" },
            { label: "نوع پاکت", value: "دست‌ساز کلاسیک" }
        ],
        rating: 5,
        purchases: 120,
        inStock: true,
    },
    {
        name: "ست مکاتبه رسمی اداری",
        description: "مجموعه نامه رسمی با ساختار استاندارد برای مکاتبات اداری، رزومه و قراردادها با فونت بسیار خوانا و شکیل.",
        price: 110000,
        images: [
            "https://picsum.photos/seed/formal1/800/600",
            "https://picsum.photos/seed/formal2/800/600"
        ],
        specs: [
            { label: "لحن نگارش", value: "رسمی و اداری" },
            { label: "سایز کاغذ", value: "A4" },
            { label: "مناسب برای", value: "سازمان‌ها و ادارات" }
        ],
        rating: 4.5,
        purchases: 90,
        inStock: true,
    },
    {
        name: "نامه تشکر و قدردانی",
        description: "نامه‌ای با لحن محترمانه و صمیمی برای تشکر از دوستان، همکاران یا اساتید.",
        price: 90000,
        images: [
            "https://picsum.photos/seed/thanks/800/600"
        ],
        specs: [
            { label: "طراحی", value: "مینی‌مال" },
            { label: "رنگ زمینه", value: "کرم روشن" }
        ],
        rating: 4.8,
        purchases: 50,
        inStock: true,
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("📡 Connected to MongoDB...");

        await Product.deleteMany();
        console.log("🗑️ Old products cleared.");

        await Product.insertMany(products);
        console.log("✅ Database seeded successfully!");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    }
};

seedProducts();
