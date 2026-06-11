import Product from "../models/Product.js";
import { generateFullSEO } from "../utils/seoGenerator.js";
import { generateSitemap } from "../utils/sitemapGenerator.js";

function createSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\u0600-\u06FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
}


// ===================== دریافت همه محصولات + فیلتر + جستجو =====================
export const getProducts = async (req, res) => {
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
                { description: { $regex: search, $options: "i" } }
            ];
        }

        let query = Product.find(filter);

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

        const products = await query.lean();

        const safeProducts = products.map((p) => {
            const safeSpecs = Array.isArray(p.specs) ? p.specs : [];
            const safeImages = Array.isArray(p.images) ? p.images : [];
            const safeMetaTags = p.metaTags || { title: "", description: "", keywords: [] };

            const priceAfterDiscount =
                p.discount && p.discount > 0
                    ? p.price - (p.price * p.discount) / 100
                    : p.price;

            return {
                ...p,
                specs: safeSpecs,
                images: safeImages,
                metaTags: safeMetaTags,
                priceAfterDiscount,
            };
        });

        res.status(200).json(safeProducts);
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ message: "خطا در دریافت محصولات" });
    }
};

// ===================== دریافت یک محصول + افزایش بازدید =====================
export const getProductBySlug = async (req, res) => {
    try {

        let product = null;

        product = await Product.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { visits: 1 } },
            { returnDocument: 'after', lean: true }
        );

        if (!product) {
            product = await Product.findByIdAndUpdate(
                req.params.slug,
                { $inc: { visits: 1 } },
                { returnDocument: 'after', lean: true }
            );
        }

        if (!product) {
            return res.status(404).json({ message: "محصول یافت نشد" });
        }

        product.specs = Array.isArray(product.specs) ? product.specs : [];
        product.images = Array.isArray(product.images) ? product.images : [];
        product.metaTags = product.metaTags || { title: "", description: "", keywords: [] };

        const priceAfterDiscount =
            product.discount && product.discount > 0
                ? product.price - (product.price * product.discount) / 100
                : product.price;

        product.priceAfterDiscount = priceAfterDiscount;

        res.status(200).json(product);

    } catch (err) {
        console.error("Get Product Error:", err);
        res.status(500).json({ message: "خطا هنگام دریافت محصول" });
    }
};

// ===================== ساخت محصول =====================
export const createProduct = async (req, res) => {
    try {

        let specs = [];
        if (req.body.specs) {
            try {
                specs = typeof req.body.specs === 'string'
                    ? JSON.parse(req.body.specs)
                    : req.body.specs;
            } catch {
                specs = [];
            }
        }

        let existingImages = [];
        if (req.body.existingImages) {
            try {
                existingImages = typeof req.body.existingImages === 'string'
                    ? JSON.parse(req.body.existingImages)
                    : req.body.existingImages;
            } catch {
                existingImages = [];
            }
        }

        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map((file) => `/uploads/${file.filename}`);
        }

        const images = [...existingImages, ...uploadedImages];

        const slug = createSlug(req.body.title);

        // 🧠 SEO هوشمند - اولویت با مقادیر دستی
        const seo = generateFullSEO({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            slug,
            images,
            price: req.body.price,
            instock: req.body.instock,
            _id: undefined, // موقع create هنوز id نداریم
        }, "product");

        const metaTags = {
            title: req.body.metaTitle || seo.metaTags.title,
            description: req.body.metaDescription || seo.metaTags.description,
            keywords: req.body.metaKeywords 
                ? req.body.metaKeywords.split(",").map(k => k.trim()).filter(Boolean) 
                : seo.metaTags.keywords
        };

        const newProduct = await Product.create({
            ...req.body,
            slug,
            specs,
            images,
            metaTags,
        });

        // 🗺️ بروزرسانی Sitemap
        await generateSitemap();

        res.status(201).json(newProduct);

    } catch (err) {
        console.error("Create Product Error:", err);
        res.status(400).json({ message: "خطا در ساخت محصول", error: err.message });
    }
};

// ===================== ویرایش محصول =====================
export const updateProduct = async (req, res) => {
    try {

        let specs = [];
        if (req.body.specs) {
            try {
                specs = typeof req.body.specs === 'string'
                    ? JSON.parse(req.body.specs)
                    : req.body.specs;
            } catch {
                specs = [];
            }
        }

        let existingImages = [];
        if (req.body.existingImages) {
            try {
                existingImages = typeof req.body.existingImages === 'string'
                    ? JSON.parse(req.body.existingImages)
                    : req.body.existingImages;
            } catch {
                existingImages = [];
            }
        }

        let uploadedImages = [];
        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map((file) => `/uploads/${file.filename}`);
        }

        const images = [...existingImages, ...uploadedImages];

        const updateData = {
            ...req.body,
            specs,
            images,
        };

        if (req.body.title) {
            updateData.slug = createSlug(req.body.title);
        }

        // 🆕 SEO - فقط اگه دستی فرستاده بشه
        if (req.body.metaTitle !== undefined) {
            updateData.metaTags = {
                title: req.body.metaTitle || "",
                description: req.body.metaDescription || "",
                keywords: req.body.metaKeywords 
                    ? req.body.metaKeywords.split(",").map(k => k.trim()).filter(Boolean) 
                    : []
            };
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "محصول پیدا نشد" });
        }

        // 🗺️ بروزرسانی Sitemap
        await generateSitemap();

        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ message: "خطا در ویرایش محصول" });
    }
};

// ===================== حذف محصول =====================
export const deleteProduct = async (req, res) => {
    try {

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "محصول پیدا نشد" });
        }

        // 🗺️ بروزرسانی Sitemap
        await generateSitemap();

        res.status(200).json({ message: "محصول با موفقیت حذف شد" });

    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ message: "خطا در حذف محصول" });
    }
};