"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Filters from "@/components/Filters";
import SkeletonCard from "@/components/SkeletonCard";
import {
  SlidersHorizontal, Package, ChevronRight, Home,
  Loader2, FilterX
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

type Product = {
  _id: string;
  title: string;
  desc?: string;
  instock: number;
  price: number;
  discount?: number;
  category?: string;
  image?: string;
  createdAt?: string | number;
  purchaseCount?: number;
  visits?: number;
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="min-h-screen px-4 md:px-8 py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-white/[0.02] rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
}

function ProductsPageInner() {
  const router = useRouter();
  const search = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [category, setCategory] = useState(search.get("category") || "");
  const [price, setPrice] = useState(Number(search.get("price") || 2000000));
  const [sort, setSort] = useState(search.get("sort") || "new");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const hasActiveFilters = category || price < 2000000 || onlyAvailable || onlyDiscounted || sort !== "new";

  useEffect(() => setMounted(true), []);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (category) query.set("category", category);
        if (price < 2000000) query.set("price", String(price));
        if (sort !== "new") query.set("sort", sort);
        if (onlyAvailable) query.set("onlyAvailable", "1");
        if (onlyDiscounted) query.set("onlyDiscounted", "1");

        const res = await fetch(`${API}/api/products?${query.toString()}`);
        if (!res.ok) throw new Error("Failed");
        const data: Product[] = await res.json();
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch Error:", error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, [category, price, sort, onlyAvailable, onlyDiscounted]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (price < 2000000) params.set("price", String(price));
    if (sort !== "new") params.set("sort", sort);
    if (onlyAvailable) params.set("onlyAvailable", "1");
    if (onlyDiscounted) params.set("onlyDiscounted", "1");
    router.replace(params.toString() ? `/products?${params}` : "/products", { scroll: false });
  }, [category, price, sort, onlyAvailable, onlyDiscounted]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(12); }, [products]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && visibleCount < products.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount(v => v + 12);
            setIsLoadingMore(false);
          }, 400);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [products.length, visibleCount, isLoadingMore]);

  const visibleProducts = products.slice(0, visibleCount);

  const clearAllFilters = () => {
    setCategory("");
    setPrice(2000000);
    setOnlyAvailable(false);
    setOnlyDiscounted(false);
    setSort("new");
  };

  if (loading) return <ProductsLoading />;

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">

        {/* BREADCRUMB */}
        <nav className={`flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mb-6 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <Home size={11} /> خانه
          </Link>
          <ChevronRight size={10} />
          <span className="text-gray-400">محصولات</span>
        </nav>

        {/* HEADER */}
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">محصولات</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {products.length > 0 ? `${products.length} محصول یافت شد` : "محصولی یافت نشد"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all">
                <FilterX size={14} /> حذف فیلترها
              </button>
            )}

            <button onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a0f1c] border border-[#1a2540] text-gray-300 hover:text-white hover:bg-[#0a0f1c]/80 transition-all active:scale-95">
              <SlidersHorizontal size={16} strokeWidth={1.5} />
              <span className="text-sm font-medium">فیلترها</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-400" />}
            </button>
          </div>
        </div>

        {/* FILTERS - wrapped in overflow-hidden container */}
        <div className="lg:sticky lg:top-20 lg:z-30 mb-8 w-full overflow-hidden">
          <Filters
            price={price} setPrice={setPrice}
            sort={sort} setSort={setSort}
            filterOpen={filterOpen} setFilterOpen={setFilterOpen}
            category={category} setCategory={setCategory}
            onlyAvailable={onlyAvailable} setOnlyAvailable={setOnlyAvailable}
            onlyDiscounted={onlyDiscounted} setOnlyDiscounted={setOnlyDiscounted}
          />
        </div>

        {/* PRODUCTS GRID */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {visibleProducts.map((p) => (
                <div key={p._id} className="animate-fade-in-up">
                  <ProductCard product={p} />
                </div>
              ))}

              {isLoadingMore && Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="animate-fade-in-up">
                  <SkeletonCard />
                </div>
              ))}
            </div>

            {visibleCount < products.length && (
              <div ref={loaderRef} className="flex items-center justify-center py-10">
                <Loader2 size={24} className="text-blue-400 animate-spin" />
              </div>
            )}

            {visibleCount < products.length && (
              <div className="text-center mt-4">
                <p className="text-xs text-gray-600">نمایش {visibleCount} از {products.length} محصول</p>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 md:py-28 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/5 flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-2">محصولی پیدا نشد</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
              با فیلترهای انتخاب شده محصولی یافت نشد. می‌توانید فیلترها را تغییر دهید یا حذف کنید.
            </p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                <FilterX size={16} /> حذف همه فیلترها
              </button>
            )}
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}