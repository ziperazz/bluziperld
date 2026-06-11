"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PenTool,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  Heart,
  Shield,
  ArrowRight,
  Award,
  Gem,
  Feather,
} from "lucide-react";

import ProductCard from "@/components/ProductCard";
import UserReviews from "@/components/UserReviews";

const API =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

/* ==================== COUNTER ==================== */

function useCounter(end: number, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let frame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / 2000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(eased * end));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [end, start]);

  return count;
}

/* ==================== SECTION SLIDER ==================== */

function SectionSlider({
  title,
  data,
  loading,
  mode,
}: {
  title: string;
  data: any[];
  loading: boolean;
  mode: "letters" | "products";
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<any[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const shuffled = [...data]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      setItems(shuffled);
    }
  }, [data]);

  const checkScroll = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const current = Math.abs(el.scrollLeft);

    setCanScrollLeft(current > 2);
    setCanScrollRight(current < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items]);

  const scroll = (dir: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;

    const cardWidth = el.querySelector(".slider-card")?.clientWidth || 240;
    const gap = 12;
    const scrollAmount = (cardWidth + gap) * 2;

    const isRTL = getComputedStyle(el).direction === "rtl";
    const leftValue = isRTL
      ? dir === "left" ? scrollAmount : -scrollAmount
      : dir === "left" ? -scrollAmount : scrollAmount;

    el.scrollBy({
      left: leftValue,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 400);
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h2 className="text-base md:text-2xl font-black text-white">
          {title}
        </h2>

        {/* Navigation - always visible */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            aria-label="قبلی"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="
              w-8 h-8 md:w-10 md:h-10
              rounded-xl md:rounded-2xl
              bg-[#0a0f1c]/90 border border-[#1a2540]
              flex items-center justify-center
              text-white
              hover:bg-blue-500/10 hover:border-blue-500/40
              hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
              transition-all duration-300
              active:scale-90
              disabled:opacity-25 disabled:cursor-not-allowed
              disabled:hover:bg-[#0a0f1c]/90 disabled:hover:border-[#1a2540]
              disabled:hover:shadow-none
            "
          >
            <ChevronLeft size={16} className="md:size-5" strokeWidth={2.5} />
          </button>

          <button
            aria-label="بعدی"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="
              w-8 h-8 md:w-10 md:h-10
              rounded-xl md:rounded-2xl
              bg-[#0a0f1c]/90 border border-[#1a2540]
              flex items-center justify-center
              text-white
              hover:bg-blue-500/10 hover:border-blue-500/40
              hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
              transition-all duration-300
              active:scale-90
              disabled:opacity-25 disabled:cursor-not-allowed
              disabled:hover:bg-[#0a0f1c]/90 disabled:hover:border-[#1a2540]
              disabled:hover:shadow-none
            "
          >
            <ChevronRight size={16} className="md:size-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="
                slider-card
                w-[60vw] min-w-[170px] max-w-[260px]
                sm:w-[42vw] sm:min-w-[210px] sm:max-w-[280px]
                md:w-[300px] md:min-w-[280px]
                h-[280px] xs:h-[300px] sm:h-[330px] md:h-[350px]
                rounded-2xl md:rounded-3xl
                bg-gradient-to-br from-white/[0.03] to-white/[0.01]
                animate-pulse border border-white/[0.03]
                flex-shrink-0
              "
            />
          ))}
        </div>
      ) : (
        <div
          ref={sliderRef}
          dir="rtl"
          className="
            flex gap-3 overflow-x-auto
            scroll-smooth no-scrollbar
            pb-2 snap-x snap-mandatory
            -mx-4 px-4
            md:-mx-0 md:px-0
          "
        >
          {items.map((item) => (
            <div
              key={item._id || item.id}
              className="
                slider-card
                w-[60vw] min-w-[170px] max-w-[260px]
                sm:w-[42vw] sm:min-w-[210px] sm:max-w-[280px]
                md:w-[300px] md:min-w-[280px]
                flex-shrink-0 snap-start
                transition-all duration-300
                hover:-translate-y-1
              "
            >
              <ProductCard product={item} mode={mode} />
            </div>
          ))}
        </div>
      )}

      {/* VIEW ALL */}
      <div className="mt-4 md:mt-6 text-center">
        <Link
          prefetch={true}
          href={mode === "letters" ? "/letters" : "/products"}
          className="
            inline-flex items-center gap-1.5
            text-[11px] md:text-sm
            text-gray-400 hover:text-blue-400
            transition-colors group
          "
        >
          مشاهده همه
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </section>
  );
}

/* ==================== MAIN ==================== */

export default function Home() {
  const [letters, setLetters] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingLetters, setLoadingLetters] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [countersVisible, setCountersVisible] = useState(false);
  const countersRef = useRef<HTMLDivElement>(null);

  const sentCount = useCounter(148, countersVisible);
  const clientCount = useCounter(142, countersVisible);
  const trustCount = useCounter(98, countersVisible);
  const qualityCount = useCounter(99, countersVisible);

  useEffect(() => {
    setMounted(true);

    const controller = new AbortController();

    const load = async () => {
      try {
        const [resL, resP] = await Promise.all([
          fetch(`${API}/api/letters`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`${API}/api/products?sort=popular`, {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (!resL.ok || !resP.ok) {
          throw new Error("Fetch failed");
        }

        const [dL, dP] = await Promise.all([
          resL.json(),
          resP.json(),
        ]);

        if (Array.isArray(dL)) setLetters(dL);
        if (Array.isArray(dP)) setProducts(dP);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoadingLetters(false);
        setLoadingProducts(false);
      }
    };

    load();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountersVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (countersRef.current) {
      observer.observe(countersRef.current);
    }

    return () => {
      controller.abort();
      observer.disconnect();
    };
  }, []);

  const stats = [
    { value: sentCount, suffix: "+", label: "نامه ارسال شده", icon: Send },
    { value: clientCount, suffix: "+", label: "مشتری راضی", icon: Heart },
    { value: trustCount, suffix: "%", label: "اعتماد شما", icon: Shield },
    { value: qualityCount, suffix: "%", label: "کیفیت کار", icon: Award },
  ];

  const features = [
    {
      icon: PenTool,
      title: "خوش‌نویسی هنرمندانه",
      desc: "هر نامه با دقت و عشق توسط خطاطان حرفه‌ای ما نوشته می‌شود.",
    },
    {
      icon: Heart,
      title: "بسته‌بندی نوستالژیک",
      desc: "لاک و مهر، پاکت‌های دست‌ساز، کاغذهای خاص؛ یک اثر هنری تمام‌عیار.",
    },
    {
      icon: Shield,
      title: "ارسال محرمانه و امن",
      desc: "نامه شما در نهایت امنیت بسته‌بندی و ارسال می‌شود.",
    },
    {
      icon: Gem,
      title: "کیفیت ممتاز",
      desc: "از کاغذ تا بسته‌بندی، همه چیز با بالاترین استاندارد انجام می‌شود.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 " />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(37,99,235,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37,99,235,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-800/4 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8">
        {/* HERO */}
        <section className="py-12 sm:py-20 md:py-28 lg:py-36 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          <div
            className={`flex justify-center order-1 lg:order-2 transition-all duration-1000 ${
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <div className="relative w-[220px] sm:w-[280px] md:w-[340px] lg:w-[390px]">
              <div className="absolute -inset-8 bg-blue-500/10 rounded-full blur-[60px] animate-pulse" />
              <div className="relative rounded-3xl overflow-hidden border border-[#1a2540]/50 bg-[#0a0f1c]/40 backdrop-blur-sm shadow-[0_0_90px_rgba(59,130,246,0.08)] group transition-all duration-700 hover:shadow-[0_0_120px_rgba(59,130,246,0.14)]">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500/10 to-blue-400/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Image
                  src="/hero-image-v3.png"
                  alt="هنر نوشتن"
                  width={800}
                  height={800}
                  priority
                  className="relative w-full h-auto object-cover rounded-3xl transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          <div
            className={`text-center lg:text-right flex flex-col gap-4 sm:gap-6 order-2 lg:order-1 transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-medium text-blue-400 w-fit mx-auto lg:mx-0">
              <Sparkles size={12} />
              پلتفرم تخصصی نامه‌های دست‌نویس
            </div>

            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight">
              لمس واقعی کلمات
              <br className="sm:hidden" /> روی{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                کاغذ ماندگار
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-gray-400 max-w-lg mx-auto lg:mx-0 leading-7 md:leading-8">
              نامه‌ای بنویس که سال‌ها ورق بخورد. ما با خطی خوش و
              بسته‌بندی هنرمندانه، احساس شما را ارسال می‌کنیم.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 sm:pt-3 justify-center lg:justify-start">
              <Link
                prefetch={true}
                href="/letters"
                className="group relative w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                <Feather
                  size={16}
                  className="group-hover:rotate-12 transition-transform duration-500"
                />
                شروع نوشتن نامه
              </Link>

              <Link
                prefetch={true}
                href="/products"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-[#0a0f1c]/60 backdrop-blur-sm border border-[#1a2540]/50 text-gray-300 hover:text-white hover:bg-[#0a0f1c]/80 text-xs sm:text-sm font-medium transition-all duration-300 hover:border-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
              >
                مشاهده محصولات
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section ref={countersRef} className="py-12 sm:py-20 md:py-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 md:gap-16">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-3 sm:gap-4 group">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/5 backdrop-blur-sm border border-blue-500/5 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/10 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500">
                    <Icon size={20} className="sm:w-6 sm:h-6 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl md:text-5xl font-black text-white tabular-nums block tracking-tight">
                      {stat.value.toLocaleString("fa-IR")}
                      {stat.suffix}
                    </span>
                    <span className="text-[10px] sm:text-[11px] md:text-sm text-gray-500 mt-1 sm:mt-2 block font-medium">
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURES - Why BluZiper? */}
        <section className="py-12 sm:py-16 md:py-24">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-blue-400 mb-4">
              <Gem size={12} />
              چرا ما متفاوتیم
            </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white mb-2 sm:mb-3">
              چرا بلو زیپر؟
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-xl mx-auto">
              ما فقط یک سرویس نیستیم، پلی هستیم بین احساس شما و کاغذ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0a0f1c]/60 to-[#0a0f1c]/30 backdrop-blur-sm border border-[#1a2540]/30 hover:border-blue-500/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden hover:shadow-[0_20px_60px_rgba(59,130,246,0.08)]"
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-blue-400/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Corner accent */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative flex flex-col items-center text-center gap-3 sm:gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/20 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] transition-all duration-300">
                      <Icon size={20} className="text-blue-400 group-hover:text-blue-300 transition-colors" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                      {f.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 group-hover:text-gray-400 leading-6 transition-colors duration-300">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SLIDERS */}
        <div className="space-y-10 sm:space-y-16 md:space-y-24 pb-12 sm:pb-20 md:pb-28">
          <SectionSlider
            title="پرطرفدارترین پاکت‌ها"
            data={letters}
            loading={loadingLetters}
            mode="letters"
          />
          <SectionSlider
            title="محصولات پرفروش"
            data={products}
            loading={loadingProducts}
            mode="products"
          />
        </div>

        {/* REVIEWS */}
        <UserReviews />

        {/* FOOTER */}
        <div className="text-center py-8 sm:py-10 border-t border-[#1a2540]/50">
          <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 tracking-wider uppercase">
            BluZiperld — جایی که کلمات جان می‌گیرند
          </p>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}