"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dayjs from "dayjs";
import jalaliday from "jalaliday";
import "dayjs/locale/fa";
import {
  Star, Quote, ChevronLeft, ChevronRight,
  User, ShoppingBag, MessageCircle
} from "lucide-react";

dayjs.extend(jalaliday);
dayjs.locale("fa");

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13}
          className={i <= rating ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)]" : "text-gray-600"} />
      ))}
    </div>
  );
}

export default function UserReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/comments/latest?limit=10`)
      .then(res => res.json())
      .then(data => { setReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setReviews([]); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center gap-4">
        {[1, 2, 3].map(i => <div key={i} className="w-[300px] md:w-[350px] h-44 rounded-2xl bg-white/[0.02] animate-pulse" />)}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/5 flex items-center justify-center mx-auto mb-4">
          <MessageCircle size={24} className="text-gray-500" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-500 font-medium">فعلاً نظری ثبت نشده</p>
        <p className="text-[11px] text-gray-600 mt-1">اولین نفری باشید که تجربه خود را به اشتراک می‌گذارد</p>
      </div>
    );
  }

  return <ReviewsSlider reviews={reviews} />;
}

function ReviewsSlider({ reviews }: { reviews: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserScrolling = useRef(false);

  // فقط آپدیت activeIndex، بدون scrollIntoView خودکار
  const updateActiveIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // اسکرول دستی به کارت
  const scrollToCard = useCallback((index: number) => {
    if (!sliderRef.current) return;
    const cards = sliderRef.current.children;
    if (cards[index]) {
      isUserScrolling.current = true;
      cards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      setTimeout(() => { isUserScrolling.current = false; }, 600);
    }
  }, []);

  // Auto-scroll - فقط activeIndex رو عوض می‌کنه، اسکرول نمی‌کنه
  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;

    autoScrollRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % reviews.length);
    }, 4000);

    return () => { if (autoScrollRef.current) clearInterval(autoScrollRef.current); };
  }, [reviews.length, isPaused]);

  // تشخیص اسکرول دستی کاربر
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (isUserScrolling.current) return;
      
      const cards = Array.from(el.children) as HTMLElement[];
      const containerCenter = el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2;
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      cards.forEach((card, i) => {
        const cardCenter = card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });
      
      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [activeIndex, reviews.length]);

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const goTo = useCallback((index: number) => {
    updateActiveIndex(index);
    scrollToCard(index);
    pauseAutoScroll();
  }, [updateActiveIndex, scrollToCard, pauseAutoScroll]);

  const goPrev = useCallback(() => {
    goTo(activeIndex === 0 ? reviews.length - 1 : activeIndex - 1);
  }, [activeIndex, reviews.length, goTo]);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % reviews.length);
  }, [activeIndex, reviews.length, goTo]);

  return (
    <div className="relative py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/10 mb-3">
          <MessageCircle size={22} className="text-blue-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white">تجربه کاربران ما</h2>
      </div>

      {/* Desktop Navigation */}
      {reviews.length > 1 && (
        <>
          <button onClick={goPrev}
            onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button onClick={goNext}
            onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </>
      )}

      {/* Cards */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-2 md:px-10 py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {reviews.map((review, i) => (
          <div
            key={review._id || i}
            onClick={() => goTo(i)}
            className={`flex-shrink-0 w-[300px] md:w-[350px] snap-center p-5 rounded-2xl border cursor-pointer transition-all duration-500 ${
              i === activeIndex
                ? "bg-white/[0.04] border-blue-500/20 shadow-lg"
                : "bg-white/[0.01] border-white/[0.04] opacity-50 hover:opacity-80"
            }`}
          >
            <Quote size={22} className="text-blue-400/10 mb-3" />
            <Stars rating={review.rating} />
            <p className="text-sm text-gray-300 leading-7 mt-3 mb-5 line-clamp-4">{review.content}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <User size={14} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{review.user?.name || "کاربر BluZiperld"}</p>
                <p className="text-[10px] text-gray-500">
                  {review.createdAt ? dayjs(review.createdAt).calendar("jalali").format("YYYY/MM/DD") : "اخیراً"}
                </p>
              </div>
              {review.isBuyer && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold flex items-center gap-1">
                  <ShoppingBag size={10} /> خریدار
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-5 h-1.5 bg-blue-400" : "w-1.5 h-1.5 bg-white/[0.08] hover:bg-white/[0.2]"
              }`} />
          ))}
        </div>
      )}
    </div>
  );
}