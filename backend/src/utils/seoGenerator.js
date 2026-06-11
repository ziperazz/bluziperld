/**
 * 🧠 BluZiperld Smart SEO Generator™
 * Ultimate Final Edition - All Keywords Included
 */

const STOP_WORDS = [
    "و", "در", "به", "از", "با", "برای", "که", "این", "آن", "را", "تا",
    "هم", "نیز", "یک", "هر", "چه", "چگونه", "اما", "یا", "اگر", "نه",
    "های", "اش", "شان", "مان", "تان", "خود", "است", "هست", "بود", "شد",
    "کرد", "باشد", "شود", "کند", "می", "نمی", "the", "a", "an", "is",
    "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "to", "of",
    "in", "for", "on", "with", "at", "by", "from", "as", "into", "through"
];

const SITE_NAME = "BluZiperld";
const SITE_URL = "https://bluziperld.ir";

function extractKeywords(text, maxWords = 10) {
    if (!text) return [];
    const cleaned = text
        .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const words = cleaned.split(/\s+/);
    const filtered = words
        .filter(w => w.length > 2)
        .filter(w => !STOP_WORDS.includes(w.toLowerCase()))
        .filter(w => isNaN(Number(w)));
    return [...new Set(filtered)].slice(0, maxWords);
}

export function generateMetaTitle(title) {
    if (!title) return SITE_NAME;
    const cleaned = title.trim();
    const suffix = ` | ${SITE_NAME}`;
    const maxLen = 60 - suffix.length;
    if (cleaned.length > maxLen) return cleaned.slice(0, maxLen - 3).trim() + "..." + suffix;
    return cleaned + suffix;
}

export function generateMetaDescription(title, description, category) {
    const fallback = `خرید ${title || "محصول"} با بهترین کیفیت و قیمت | ${SITE_NAME} | ${category || ""}`;
    if (!description || description.trim().length === 0) return fallback.slice(0, 160);
    const cleaned = description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (cleaned.length <= 160) return cleaned;
    return cleaned.slice(0, 157).trim() + "...";
}

export function generateKeywords(title, description, category, type = "product") {
    const titleWords = extractKeywords(title, 8);
    const descWords = extractKeywords(description, 8);
    const catWords = category ? extractKeywords(category, 5) : [];

    // 🔥 کامل‌ترین کلمات کلیدی برای پاکت نامه
    const letterBaseWords = [
        // نوشتن و خوشنویسی
        "نامه دست‌نویس",
        "سفارش نامه دست‌نویس",
        "نوشتن نامه با دست",
        "نامه با دست خط زیبا",
        "خوشنویسی نامه",
        "تحریر نامه",
        "نامه نگاری",
        "متن نامه آماده",
        "نامه اداری دست‌نویس",
        "نامه رسمی",
        "نامه نویسی آنلاین",
        "خدمات نامه نگاری",
        "سفارش آنلاین نامه",
        "سفارش نامه اینترنتی",
        "خرید نامه دست‌نویس",
        "قیمت نامه دست‌نویس",
        "هزینه نوشتن نامه",
        "نامه سفارشی",
        // ارسال و پست
        "ارسال نامه",
        "نامه پستی",
        "ارسال فوری نامه",
        "پست نامه",
        "نامه به سراسر ایران",
        "نامه به شهرستان",
        "ارسال به آدرس",
        "تحویل نامه",
        "پست پیشتاز",
        "نامه رسانی",
        "ارسال نامه به دیگران",
        // احساسی و مناسبتی
        "نامه عاشقانه",
        "نامه عاشقانه دست‌نویس",
        "نامه تولد",
        "نامه خداحافظی",
        "نامه قدردانی",
        "نامه احساسی",
        "نامه به دوست",
        "نامه به مادر",
        "نامه به همسر",
        "هدیه تولد خاص",
        "کادو خاص",
        "هدیه احساسی",
        "نامه مناسبتی",
        "نامه تبریک",
        "نامه تسلیت",
        // پاکت و بسته‌بندی
        "پاکت نامه",
        "پاکت نامه دست‌ساز",
        "پاکت نامه لاکچری",
        "پاکت کرافت",
        "پاکت وینتیج",
        "بسته‌بندی نامه",
        "لاک و مهر",
        "کاغذ دست‌ساز",
        "پاکت فانتزی",
        "پاکت کلاسیک",
        "پاکت نامه خاص",
        // کیفیت و برند
        SITE_NAME,
        "بهترین خط",
        "خطاط حرفه‌ای",
        "کیفیت عالی",
        "نامه اصل",
        "ضمانت ارسال",
        "تحویل به موقع",
        "بسته‌بندی شکیل",
        "کاغذ با کیفیت",
        "جوهر اصل",
    ];

    // 🔥 کامل‌ترین کلمات کلیدی برای محصولات
    const productBaseWords = [
        "محصول",
        "فروشگاه",
        SITE_NAME,
        "خرید",
        "خرید آنلاین",
        "قیمت مناسب",
        "کیفیت بالا",
        "ارسال سریع",
        "ارسال رایگان",
        "تخفیف",
        "تخفیف ویژه",
        "جدید",
        "پرفروش",
        "محصول اصل",
        "گارانتی",
        "فروش ویژه",
        "حراج",
        "پیشنهاد ویژه",
        "بهترین قیمت",
        "مقایسه قیمت",
    ];

    const baseWords = type === "letter" ? letterBaseWords : productBaseWords;

    // ترکیب همه + حذف تکراری + محدود به ۲۰ تا
    return [...new Set([...titleWords, ...catWords, ...descWords, ...baseWords])].slice(0, 20);
}

export function generateFullSEO(data, type = "product") {
    const { title, description, category, slug, images, price, instock, _id } = data;
    const metaTitle = generateMetaTitle(title);
    const metaDescription = generateMetaDescription(title, description, category);
    const metaKeywords = generateKeywords(title, description, category, type);
    const pageUrl = type === "letter" ? `${SITE_URL}/letters/${slug}` : `${SITE_URL}/products/${slug || _id}`;
    const imageUrl = images?.[0]
        ? (images[0].startsWith("http") ? images[0] : `${SITE_URL}${images[0]}`)
        : `${SITE_URL}/og-default.png`;

    return {
        metaTags: { 
            title: metaTitle, 
            description: metaDescription, 
            keywords: metaKeywords 
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            images: [{ url: imageUrl, width: 1200, height: 630 }],
            type: "product",
            siteName: SITE_NAME,
            locale: "fa_IR",
            url: pageUrl,
        },
        twitter: {
            card: "summary_large_image",
            title: metaTitle,
            description: metaDescription,
            images: [imageUrl],
        },
        canonical: pageUrl,
        robots: "index, follow, max-image-preview:large",
        schema: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: title,
            description: metaDescription,
            image: imageUrl,
            sku: _id,
            category: category || (type === "letter" ? "پاکت نامه" : "محصول"),
            offers: {
                "@type": "Offer",
                price: price,
                priceCurrency: "IRR",
                availability: (instock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                url: pageUrl,
            },
        },
    };
}