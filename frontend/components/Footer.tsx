"use client";

import { useState, useEffect } from "react";
import {
  Mail, Phone, Clock, ShieldCheck, CreditCard,
  ArrowUp, Heart, Sparkles, Zap, Send, ChevronRight, Star
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const glassBg = {
    background: "rgba(8,12,24,0.85)",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
  };

  return (
    <>
      {/* ============ SCROLL TO TOP - بالاتر رفته ============ */}
      <button onClick={scrollToTop}
        className={`fixed bottom-32 md:bottom-36 right-4 md:right-6 z-40 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/20 transition-all duration-500 hover:scale-110 active:scale-90 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}>
        <ArrowUp size={18} className="text-white" strokeWidth={2.5} />
      </button>

      {/* ============ FOOTER ============ */}
      <footer id="footer" className="relative mt-16 md:mt-20 px-3 sm:px-4 select-none">
        {/* Decorative top line */}
        <div className="max-w-6xl mx-auto mb-4 md:mb-6">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Main Card */}
          <div className="relative p-4 sm:p-6 md:p-10 rounded-2xl md:rounded-3xl overflow-hidden border border-[#1a2540]"
            style={glassBg}>
            
            {/* Background glow - فقط آبی تیره */}
            <div className="absolute top-0 right-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-blue-500/5 rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-blue-600/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

            {/* ============ GRID ============ */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 mb-6 md:mb-8">
              
              {/* Brand */}
              <div className="space-y-3 text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <h3 className="text-sm font-black text-white tracking-wide">BluZiperld</h3>
                </div>
                
                <p className="text-[11px] md:text-sm leading-6 md:leading-7 text-gray-400 max-w-xs mx-auto sm:mx-0">
                  نوشتن نامه هیچوقت قدیمی نمی‌شود. ما متن‌هایی خاص و ماندگار می‌نویسیم و به دست مخاطبتان می‌رسانیم.
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] md:text-xs text-gray-600 pt-1">
                  <span>ساخته شده با</span>
                  <Heart size={11} className="text-blue-400 fill-blue-400/80 animate-pulse" />
                  <span>توسط Amirreza</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-3 text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <Zap size={13} className="text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-300">دسترسی سریع</h3>
                </div>

                <ul className="space-y-1.5">
                  {[
                    { href: "/rules", label: "قوانین و مقررات" },
                    { href: "/support", label: "پشتیبانی" },
                    { href: "/about-us", label: "درباره ما" },
                    { href: "/support/new", label: "تماس با ما" },
                  ].map((item, i) => (
                    <li key={i}>
                      <Link href={item.href}
                        className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] md:text-sm text-gray-400 hover:text-blue-400 transition-all duration-300 group">
                        <ChevronRight size={11} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-3 text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <Send size={13} className="text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-300">ارتباط با ما</h3>
                </div>

                <div className="space-y-2 text-[11px] md:text-sm text-gray-400">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Mail size={13} className="text-blue-400" />
                    </div>
                    <span dir="ltr" className="text-[11px] md:text-sm truncate">BluZiperLd@gmail.com</span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Phone size={13} className="text-blue-400" />
                    </div>
                    <span dir="ltr" className="text-[11px] md:text-sm">09930810025</span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Clock size={13} className="text-blue-400" />
                    </div>
                    <span className="text-[11px] md:text-sm">پاسخگویی: ۹ صبح تا ۹ شب</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============ DIVIDER ============ */}
            <div className="relative my-4 md:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
              </div>
              <div className="relative flex justify-center">
                <div className="px-3 md:px-4 bg-[#0a0f1e]/80 rounded-full">
                  <Star size={10} className="text-blue-500/40 md:w-3 md:h-3" />
                </div>
              </div>
            </div>

            {/* ============ BOTTOM - ریسپانسیوتر ============ */}
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <p className="text-[9px] md:text-xs text-gray-500 text-center order-2 md:order-1">
                © 2026 — کلیه حقوق برای <span className="text-blue-400/70 font-bold">BluZiperld</span> محفوظ است.
              </p>

              {/* Badges */}
              <div className="flex items-center justify-center gap-3 md:gap-4 order-1 md:order-2 flex-wrap">
                {/* ============ ENAMAD ============ */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-blue-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-xl md:rounded-2xl bg-white/[0.02] border border-[#1a2540] flex items-center justify-center shadow-lg group-hover:border-blue-500/30 group-hover:scale-105 transition-all duration-500 overflow-hidden p-1">
                    <a
                      referrerPolicy="origin"
                      target="_blank"
                      href="https://trustseal.enamad.ir/?id=732535&Code=se7mECH3vxLCAIQLBUgG2LUL6hLoTGaR"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-full"
                    >
                      <img
                        referrerPolicy="origin"
                        src="https://trustseal.enamad.ir/logo.aspx?id=732535&Code=se7mECH3vxLCAIQLBUgG2LUL6hLoTGaR"
                        alt="نشان اعتماد الکترونیکی اینماد"
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </a>
                  </div>
                </div>

                {/* ============ ZARINPAL - فقط آبی تیره ============ */}
                <div className="group relative">
                  <div className="absolute -inset-1 bg-blue-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-xl md:rounded-2xl bg-white/[0.02] border border-[#1a2540] flex flex-col items-center justify-center gap-0.5 shadow-lg group-hover:border-blue-500/30 group-hover:scale-105 transition-all duration-500">
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <CreditCard size={16} className="text-blue-400" strokeWidth={1.5} />
                    </div>
                    <span className="text-[7px] md:text-[9px] font-black text-blue-400/80 tracking-wider">زرین‌پال</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-4 md:h-6" />
      </footer>
    </>
  );
}