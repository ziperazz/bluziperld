"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Headset, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SupportButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // بررسی اینکه آیا توی صفحه پشتیبانی هستیم
  const isSupportPage = pathname.startsWith("/support");

  // مخفی/ظاهر شدن دکمه موقع اسکرول
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // نمایش تولتیپ بعد از 3 ثانیه
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ease-out ${
        isVisible && !isSupportPage
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      }`}
    >
      {/* تولتیپ */}
      <div
        className={`absolute bottom-full left-0 mb-3 transition-all duration-300 ${
          showTooltip && !isSupportPage
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="relative bg-gradient-to-r from-blue-600/95 to-cyan-600/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-4 py-2.5 whitespace-nowrap">
          <p className="text-white text-xs font-bold flex items-center gap-1.5">
            <Sparkles size={12} className="text-yellow-300" />
            نیاز به راهنمایی داری؟
          </p>
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-cyan-600/95 rotate-45 border-r border-b border-white/20" />
        </div>
      </div>

      {/* دکمه اصلی */}
      <Link
        href="/support/new"
        onMouseEnter={() => setShowTooltip(false)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 hover:border-blue-400/30 hover:bg-white/[0.1] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* حلقه‌های glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500/20 animate-ping-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-500/15 animate-ping-slower" />
        </div>

        {/* آیکون */}
        <Headset
          size={22}
          className="text-gray-300 group-hover:text-white transition-colors duration-300 relative"
          strokeWidth={1.5}
        />

        {/* نقطه سبز آنلاین */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#030712] animate-pulse" />
      </Link>

      <style jsx>{`
        @keyframes ping-slow {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          75%, 100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          75%, 100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping-slower 3.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}