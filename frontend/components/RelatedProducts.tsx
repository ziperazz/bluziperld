"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Loader2, Package } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

export default function RelatedProducts({ 
  excludeId, 
  category, 
  mode = "product" 
}: { 
  excludeId?: string; 
  category?: string; 
  mode?: "product" | "letter";
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const endpoint = mode === "letter" ? "letters" : "products";
        const res = await fetch(`${API}/api/${endpoint}?limit=6&sort=popular`);
        const data = await res.json();
        
        let filtered = Array.isArray(data) ? data : [];
        
        // حذف محصول فعلی
        if (excludeId) {
          filtered = filtered.filter((p: any) => p._id !== excludeId);
        }
        
        setProducts(filtered.slice(0, 4));
      } catch (err) {
        console.error("Related products error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [excludeId, mode]);

  if (loading) {
    return (
      <div className="mt-16 pt-10 border-t border-white/[0.04]">
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-white/[0.04]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
          <Package size={24} className="text-blue-400" />
          {mode === "letter" ? "پاکت‌نامه‌های مشابه" : "محصولات پیشنهادی"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {mode === "letter" ? "شاید این پاکت‌نامه‌ها رو هم دوست داشته باشی" : "محصولاتی که شاید بپسندی"}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p._id} className="animate-fade-in-up">
            <ProductCard
              mode={mode === "letter" ? "letters" : "product"}
              product={{
                id: p._id,
                slug: p.slug,
                title: p.title,
                price: p.price,
                image: p.images?.[0] || p.image,
                desc: p.description,
                discount: p.discount,
                instock: p.instock,
                priceAfterDiscount: p.priceAfterDiscount,
                purchaseCount: p.purchaseCount || 0,
                ratingAverage: p.ratingAverage || 0,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}