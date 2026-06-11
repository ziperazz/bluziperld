import fs from "fs";
import path from "path";
import Product from "../models/Product.js";
import Letter from "../models/Letter.js";

const SITE_URL = "https://bluziperld.ir";
const SITEMAP_PATH = "/var/www/bluziperld/frontend/public/sitemap.xml";

export async function generateSitemap() {
    try {
        const products = await Product.find({}).select("slug title updatedAt").lean();
        const letters = await Letter.find({}).select("slug title updatedAt").lean();

        const urls = [];

        // Static pages
        urls.push({ loc: `${SITE_URL}/`, priority: "1.0", changefreq: "daily" });
        urls.push({ loc: `${SITE_URL}/products`, priority: "0.9", changefreq: "daily" });
        urls.push({ loc: `${SITE_URL}/letters`, priority: "0.9", changefreq: "daily" });
        urls.push({ loc: `${SITE_URL}/cart`, priority: "0.7", changefreq: "weekly" });
        urls.push({ loc: `${SITE_URL}/about-us`, priority: "0.6", changefreq: "monthly" });
        urls.push({ loc: `${SITE_URL}/rules`, priority: "0.5", changefreq: "monthly" });
        urls.push({ loc: `${SITE_URL}/support`, priority: "0.7", changefreq: "weekly" });

        // Products
        products.forEach(p => {
            urls.push({
                loc: `${SITE_URL}/products/${p.slug || p._id}`,
                lastmod: p.updatedAt?.toISOString()?.split("T")[0],
                priority: "0.8",
                changefreq: "weekly",
            });
        });

        // Letters
        letters.forEach(l => {
            urls.push({
                loc: `${SITE_URL}/letters/${l.slug || l._id}`,
                lastmod: l.updatedAt?.toISOString()?.split("T")[0],
                priority: "0.8",
                changefreq: "weekly",
            });
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority || "0.5"}</priority>
    <changefreq>${u.changefreq || "monthly"}</changefreq>
  </url>`).join("\n")}
</urlset>`;

        // مطمئن شو پوشه وجود داره
        const dir = path.dirname(SITEMAP_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(SITEMAP_PATH, xml);
        console.log(`✅ Sitemap generated: ${urls.length} URLs`);

        // 🤖 پینگ خودکار به گوگل
        try {
            const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`;
            await fetch(pingUrl);
            console.log("📢 Google pinged successfully!");
        } catch (pingError) {
            // بی‌صدا رد شو - پینگ اختیاریه
            console.log("⚠️ Google ping failed (will retry next time)");
        }

    } catch (error) {
        console.error("Sitemap generation error:", error);
    }
}