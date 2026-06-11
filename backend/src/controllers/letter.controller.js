import Letter from "../models/letter.js";
import { generateFullSEO } from "../utils/seoGenerator.js";
import { generateSitemap } from "../utils/sitemapGenerator.js";

const createSlug = (text) => {
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\u200c]/g, " ")
        .replace(/\s+/g, "-")
        .replace(/[^\u0600-\u06FFa-z0-9\-]/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const normalizeToArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const parseSpecs = (specs) => {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs;

    try {
        return JSON.parse(specs);
    } catch {
        return [];
    }
};

const mapUploadedFiles = (files) => {
    if (!files || !Array.isArray(files)) return [];
    return files.map((file) => `/uploads/${file.filename}`);
};

// =========================
// دریافت همه نامه‌ها + فیلتر + سرچ
// =========================
export const getLetters = async (req, res) => {
    try {
        const {
            category,
            sort,
            price,
            maxPrice,
            onlyAvailable,
            onlyDiscounted,
            search
        } = req.query;

        const filter = {};

        if (category && category !== "all") {
            filter.category = category;
        }

        if (onlyAvailable === "true" || onlyAvailable === true || onlyAvailable === "1") {
            filter.instock = { $gt: 0 };
        }

        if (onlyDiscounted === "true" || onlyDiscounted === true || onlyDiscounted === "1") {
            filter.discount = { $gt: 0 };
        }

        const priceLimit = price || maxPrice;
        if (priceLimit && Number(priceLimit) > 0) {
            filter.price = { $lte: Number(priceLimit) };
        }

        if (search && search.trim() !== "") {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }

        let query = Letter.find(filter);

        switch (sort) {
            case "cheap":
                query = query.sort({ price: 1 });
                break;
            case "expensive":
                query = query.sort({ price: -1 });
                break;
            case "popular":
                query = query.sort({ purchaseCount: -1 });
                break;
            case "visited":
                query = query.sort({ visits: -1 });
                break;
            case "new":
            default:
                query = query.sort({ createdAt: -1 });
        }

        const letters = await query;

        res.json(letters);
    } catch (error) {
        console.error("خطا در دریافت نامه‌ها:", error);
        res.status(500).json({ message: "خطا در دریافت نامه‌ها" });
    }
};

// =========================
// دریافت یک نامه با slug + افزایش بازدید
// =========================
export const getLetterBySlug = async (req, res) => {
    try {
        const letter = await Letter.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { visits: 1 } },
            { returnDocument: 'after' }
        );

        if (!letter) {
            return res.status(404).json({ message: "نامه پیدا نشد" });
        }

        res.json(letter);
    } catch (error) {
        console.error("خطا در دریافت نامه:", error);
        res.status(500).json({ message: "خطا در دریافت نامه" });
    }
};

// =========================
// ایجاد نامه جدید
// =========================
export const createLetter = async (req, res) => {
    try {
        const uploadedImages = mapUploadedFiles(req.files);
        const slug = createSlug(req.body.title);

        // 🧠 SEO هوشمند - اولویت با مقادیر دستی
        const seo = generateFullSEO({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            slug,
            images: uploadedImages,
            price: req.body.price,
            instock: req.body.instock,
        }, "letter");

        const metaTags = {
            title: req.body.metaTitle || seo.metaTags.title,
            description: req.body.metaDescription || seo.metaTags.description,
            keywords: req.body.metaKeywords 
                ? req.body.metaKeywords.split(",").map(k => k.trim()).filter(Boolean) 
                : seo.metaTags.keywords
        };

        const newLetter = new Letter({
            title: req.body.title,
            slug,
            description: req.body.description || "",
            category: req.body.category || "",
            price: Number(req.body.price) || 0,
            discount: Number(req.body.discount) || 0,
            instock: Number(req.body.instock) || 0,
            isActive: req.body.isActive === "true" || req.body.isActive === true,
            printingExtraPrice: Number(req.body.printingExtraPrice) || 0,
            handwritingExtraPrice: Number(req.body.handwritingExtraPrice) || 0,
            visits: Number(req.body.visits) || 0,
            purchaseCount: Number(req.body.purchaseCount) || 0,
            ratingAverage: Number(req.body.ratingAverage) || 0,
            rating: Number(req.body.rating) || 0,
            specs: parseSpecs(req.body.specs),
            images: uploadedImages,
            metaTags,
        });

        const savedLetter = await newLetter.save();
        
        // 🗺️ بروزرسانی Sitemap
        await generateSitemap();

        res.status(201).json(savedLetter);
    } catch (error) {
        console.error("خطا در ایجاد نامه:", error);
        res.status(500).json({
            message: "خطا در ایجاد نامه",
            error: error.message,
        });
    }
};

// =========================
// ویرایش نامه
// =========================
export const updateLetter = async (req, res) => {
    try {
        const letter = await Letter.findById(req.params.id);

        if (!letter) {
            return res.status(404).json({ message: "نامه پیدا نشد" });
        }

        const existingImages = normalizeToArray(req.body.existingImages).filter(Boolean);
        const uploadedImages = mapUploadedFiles(req.files);
        const finalImages = [...existingImages, ...uploadedImages];

        if (req.body.title && req.body.title !== letter.title) {
            letter.title = req.body.title;
            letter.slug = createSlug(req.body.title);
        } else {
            letter.title = letter.title;
        }

        letter.description = req.body.description ?? letter.description;
        letter.category = req.body.category ?? letter.category;
        letter.price = req.body.price !== undefined ? Number(req.body.price) : letter.price;
        letter.discount = req.body.discount !== undefined ? Number(req.body.discount) : letter.discount;
        letter.instock = req.body.instock !== undefined ? Number(req.body.instock) : letter.instock;

        if (req.body.isActive !== undefined) {
            letter.isActive = req.body.isActive === "true" || req.body.isActive === true;
        }

        letter.printingExtraPrice = req.body.printingExtraPrice !== undefined ? Number(req.body.printingExtraPrice) : letter.printingExtraPrice;
        letter.handwritingExtraPrice = req.body.handwritingExtraPrice !== undefined ? Number(req.body.handwritingExtraPrice) : letter.handwritingExtraPrice;

        letter.visits = req.body.visits !== undefined ? Number(req.body.visits) : letter.visits;
        letter.purchaseCount = req.body.purchaseCount !== undefined ? Number(req.body.purchaseCount) : letter.purchaseCount;
        letter.ratingAverage = req.body.ratingAverage !== undefined ? Number(req.body.ratingAverage) : letter.ratingAverage;
        letter.rating = req.body.rating !== undefined ? Number(req.body.rating) : letter.rating;

        if (req.body.specs !== undefined) {
            letter.specs = parseSpecs(req.body.specs);
        }

        // 🆕 SEO - اگه دستی فرستاده بشه همون، وگرنه خودکار
        if (req.body.metaTitle !== undefined) {
            letter.metaTags = {
                title: req.body.metaTitle || "",
                description: req.body.metaDescription || "",
                keywords: req.body.metaKeywords 
                    ? req.body.metaKeywords.split(",").map(k => k.trim()).filter(Boolean) 
                    : []
            };
        }

        letter.images = finalImages;

        const updatedLetter = await letter.save();
        
        // 🗺️ بروزرسانی Sitemap
        await generateSitemap();

        res.json(updatedLetter);
    } catch (error) {
        console.error("خطا در ویرایش نامه:", error);
        res.status(500).json({
            message: "خطا در ویرایش نامه",
            error: error.message,
        });
    }
};

// =========================
// حذف نامه
// =========================
export const deleteLetter = async (req, res) => {
    try {
        const deletedLetter = await Letter.findByIdAndDelete(req.params.id);

        if (!deletedLetter) {
            return res.status(404).json({ message: "نامه پیدا نشد" });
        }

        // 🗺️ بروزرسانی Sitemap
        await generateSitemap();

        res.json({ message: "نامه با موفقیت حذف شد" });
    } catch (error) {
        console.error("خطا در حذف نامه:", error);
        res.status(500).json({ message: "خطا در حذف نامه" });
    }
};