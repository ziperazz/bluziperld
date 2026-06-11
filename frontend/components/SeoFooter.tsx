"use client";

export default function SeoFooter({ product, type }: { product: any; type: "letter" | "product" }) {
  if (!product) return null;

  const keywords = [
    product.title,
    product.category,
    type === "letter" ? "پاکت نامه" : "محصول",
    "نامه دست‌نویس",
    "کادو",
    "هدیه",
    "BluZiperld",
    "خرید پاکت نامه",
    "نامه عاشقانه",
    "خوشنویسی",
    "دست‌نویس",
    "پست",
    "ارسال نامه",
    "کاغذ",
    "بسته‌بندی",
  ]
    .filter(Boolean)
    .filter((kw, i, arr) => arr.indexOf(kw) === i)
    .slice(0, 10);

  const relatedLinks = [
    { text: "پاکت نامه‌ها", href: "/letters" },
    { text: "محصولات", href: "/products" },
    { text: "سبد خرید", href: "/cart" },
  ];

  return (
    <footer className="mt-12 pt-8 border-t border-white/[0.03] space-y-6" dir="rtl">

      {/* Keywords - خیلی کمرنگ که کاربر نبینه ولی سئو میبینه */}
      <div className="select-none opacity-20 hover:opacity-40 transition-opacity">
        <p className="text-[8px] text-gray-600 mb-2">کلمات کلیدی:</p>
        <div className="flex flex-wrap gap-1">
          {keywords.map((kw, i) => (
            <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.01] text-gray-600">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px]">
        {relatedLinks.map((link, i) => (
          <a key={i} href={link.href} className="text-gray-700 hover:text-gray-500 transition-colors">
            {link.text}
          </a>
        ))}
      </div>

      {/* Copyright */}
      <p className="text-[9px] text-gray-800 text-center">
        © {new Date().getFullYear()} BluZiperld — همه حقوق محفوظ است.
      </p>
    </footer>
  );
}