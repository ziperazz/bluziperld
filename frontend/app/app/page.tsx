"use client";

import { Download, Smartphone, Shield, Zap, ArrowLeft, Sparkles, Star } from "lucide-react";
import Link from "next/link";

export default function AppDownloadPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-purple-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-[80px]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          >
            {i % 2 === 0 ? (
              <Sparkles size={12} className="text-blue-400/20" />
            ) : (
              <Star size={8} className="text-purple-400/20" />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-lg shadow-blue-500/30 flex items-center justify-center animate-scaleIn">
              <Smartphone size={44} className="text-white animate-bounce-slow" />
            </div>
            <div className="absolute -inset-3 rounded-3xl border-2 border-blue-500/20 animate-ping opacity-0" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white animate-fadeInUp">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              اپلیکیشن BluZiperld
            </span>
          </h1>
          <p className="text-sm text-gray-400 leading-7 animate-fadeInUp" style={{ animationDelay: "0.15s" }}>
            نسخه اندروید اپلیکیشن رسمی BluZiperld را دانلود و نصب کنید. سفارش نامه دست‌نویس حالا راحت‌تر از همیشه.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
          {[
            { icon: Zap, label: "سرعت بالا", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { icon: Shield, label: "امن و مطمئن", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { icon: Smartphone, label: "نصب آسان", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className={`p-4 rounded-2xl bg-white/[0.02] border ${feat.border} hover:scale-105 hover:${feat.bg} transition-all duration-300 group cursor-default`}>
                <Icon size={22} className={`${feat.color} mx-auto mb-1.5 group-hover:scale-110 transition-transform duration-300`} />
                <p className="text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">{feat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Download Button */}
        <div className="animate-fadeInUp" style={{ animationDelay: "0.45s" }}>
          <a
            href="/BluZiperld.apk"
            download="BluZiperld.apk"
            className="group relative flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Download size={24} className="group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 relative z-10" />
            <span className="relative z-10">دانلود اپلیکیشن (APK)</span>
            <span className="absolute right-4 w-2 h-2 rounded-full bg-white/50 animate-ping" />
            <span className="absolute right-4 w-2 h-2 rounded-full bg-white" />
          </a>
        </div>

        <p className="text-[10px] text-gray-600 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
          نسخه {new Date().toLocaleDateString("fa-IR")} | حجم تقریبی ۲ مگابایت
        </p>

        {/* Instructions */}
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-right space-y-3 hover:bg-amber-500/[0.07] transition-all duration-300 animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
          <p className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            راهنمای نصب:
          </p>
          <ol className="text-[11px] text-gray-400 space-y-2 list-decimal list-inside leading-6">
            <li className="hover:text-gray-300 transition-colors">روی دکمه دانلود کلیک کن</li>
            <li className="hover:text-gray-300 transition-colors">فایل APK رو باز کن</li>
            <li className="hover:text-gray-300 transition-colors">اگه پیغام "نصب از منابع ناشناس" اومد، Allow رو بزن</li>
            <li className="hover:text-gray-300 transition-colors">اپلیکیشن نصب میشه و می‌تونی استفاده کنی</li>
          </ol>
        </div>

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors group animate-fadeInUp"
          style={{ animationDelay: "0.7s" }}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          بازگشت به سایت
        </Link>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }
        .animate-scaleIn { animation: scaleIn 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  );
}
