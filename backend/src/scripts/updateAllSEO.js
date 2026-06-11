import mongoose from "mongoose";
import Product from "../models/Product.js";
import Letter from "../models/Letter.js";
import { generateFullSEO } from "../utils/seoGenerator.js";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/letter-service";

async function updateAllSEO() {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // آپدیت محصولات
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    for (const product of products) {
        if (!product.metaTags || !product.metaTags.title) {
            const seo = generateFullSEO({
                title: product.title,
                description: product.description,
                category: product.category,
                slug: product.slug || product._id,
                images: product.images,
                price: product.price,
                instock: product.instock,
                _id: product._id,
            }, "product");

            product.metaTags = seo.metaTags;
            await product.save();
            console.log(`✅ Updated: ${product.title}`);
        }
    }

    // آپدیت نامه‌ها
    const letters = await Letter.find({});
    console.log(`Found ${letters.length} letters`);

    for (const letter of letters) {
        if (!letter.metaTags || !letter.metaTags.title) {
            const seo = generateFullSEO({
                title: letter.title,
                description: letter.description,
                category: letter.category,
                slug: letter.slug || letter._id,
                images: letter.images,
                price: letter.price,
                instock: letter.instock,
                _id: letter._id,
            }, "letter");

            letter.metaTags = seo.metaTags;
            await letter.save();
            console.log(`✅ Updated: ${letter.title}`);
        }
    }

    console.log("🎉 All SEO updated!");
    process.exit(0);
}

updateAllSEO();
