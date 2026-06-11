"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Mail, Heart, Package, Rocket, Shield, CreditCard,
  Lock, HeadphonesIcon, Sparkles, Star, Zap,
  Send, ChevronRight, ArrowRight, Eye
} from "lucide-react";

/* ==================== PARTICLES ==================== */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {Array.from({ length: 10 }).map((_, i) => {
      const icons = [Sparkles, Star, Zap, Heart];
      const Icon = icons[i % 4];
      return (
        <div
          key={i}
          className="absolute animate-float-particle"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            opacity: 0.1 + Math.random() * 0.15,
          }}
        >
          <Icon size={8 + Math.random() * 10} className="text-blue-400" />
        </div>
      );
    })}
  </div>
);

/* ==================== COMPONENT ==================== */
export default function AboutUsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    { icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", title: "نامه‌هایی که حرف دل رو می‌زنن", desc: "هر نامه‌ای که از دست ما درمیاد، انگار با دقت خودت نوشتی؛ اما با قلمی بهتر و احساس بیشتر." },
    { icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", title: "حفظ روح اصلی پیامت", desc: "چیزی مثل همون حس که می‌خوای منتقل کنی، نه رسمی و خشک، نه زیادی لوس. یه جور حس خوب بین این دو." },
    { icon: Package, color: "text-violet-400", bg: "bg-violet-500/10", title: "ارسال به هر جا که بخوای", desc: "پاکت رو انتخاب می‌کنی، متن رو می‌نویسی، ما چاپ می‌کنیم و می‌فرستیم به هر آدرسی که تو بگی." },
    { icon: Rocket, color: "text-teal-400", bg: "bg-teal-500/10", title: "کار راحت و بی‌دردسر", desc: "تو فقط تصمیم می‌گیری، ما باقی کارها رو انجام می‌دیم — با سرعت، دقت و کلی عشق." },
  ];

  const steps = [
    { n: "۰۱", icon: Eye, title: "پاکت رویایی‌ات رو انتخاب کن", desc: "یه پاکت دلپذیر پیدا کن که حرفت رو قشنگ‌تر کنه و به چشم بیاد." },
    { n: "۰۲", icon: Sparkles, title: "متن دلت رو باکیفیت بنویس", desc: "بدون استرس، هرچی تو دلت هست رو بنویس، ما کارمون اینه که قشنگ چاپش کنیم." },
    { n: "۰۳", icon: Zap, title: "دست به کار چاپ و بسته‌بندی", desc: "متنت چاپ میشه و تو پاکت قرار می‌گیره، مثل یه هدیه ارزشمند." },
    { n: "۰۴", icon: Send, title: "نامه میره به مقصدش", desc: "ما نامه رو میفرستیم تا برسه دست کسی که باید اون حس رو دریافت کنه." },
  ];

  const trust = [
    { icon: Shield, title: "نماد اعتماد الکترونیکی", desc: "سایت ما دارای نماد اینماد است. هویت و فعالیت سایت توسط مراجع رسمی تأیید شده." },
    { icon: CreditCard, title: "پرداخت امن با زرین‌پال", desc: "پرداخت‌ها از طریق درگاه معتبر زرین‌پال انجام می‌شود. اطلاعات کارت بانکی شما هرگز روی سرور ما ذخیره نمی‌شود." },
    { icon: Lock, title: "حفظ حریم خصوصی", desc: "متن نامه شما فقط برای چاپ استفاده می‌شود. هیچ‌جا منتشر نمی‌شود." },
    { icon: HeadphonesIcon, title: "پشتیبانی واقعی", desc: "اگر سوال یا مشکلی داشته باشید، تیم پشتیبانی پاسخگوست." },
  ];

  const faqs = [
    { q: "داستان BluZiperld از کجا شروع شد؟", a: "دیدیم همه‌چیز شده پیام فوری و ایمیل، اما هنوز خیلی‌ها دنبال حس واقعی یه نامه‌ان. ما اومدیم این حس رو دوباره زنده کنیم." },
    { q: "واقعاً خودتون نامه‌ها رو می‌فرستید؟", a: "بله، از ابتدا تا انتها. چاپ می‌کنیم، داخل پاکت قرار می‌دهیم، و مستقیم به آدرس مورد نظر ارسال می‌کنیم." },
    { q: "متن‌ها چطور نوشته می‌شن؟", a: "کاملاً شخصی و طبیعی. هر کدوم مخصوص تو و لحن خودته." },
    { q: "اگه اشتباه نوشتیم چی؟", a: "نگران نباش! می‌تونی سریع به پشتیبانی اطلاع بدی تا متن رو اصلاح کنیم." },
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] transition-all duration-[2000ms] ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
          <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px] transition-all duration-[2000ms] delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[100px] transition-all duration-[2000ms] delay-500 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
        </div>

        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "60px 60px" }}
        />

        <FloatingParticles />

        <div className="relative max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-right order-2 lg:order-1">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <Sparkles size={14} className="animate-pulse" />
                <span>درباره BluZiperld</span>
              </div>

              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                داستان ما
                <span className="block mt-3 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
                  BluZiperld
                </span>
              </h1>

              <p className={`mt-6 max-w-xl text-base md:text-lg leading-8 text-gray-400 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                اینجا محیطیست برای آدمایی که می‌خوان حرف دلشون رو به سبک کلاسیک و با طعم نوآوری بفرستن.
                تو فقط پاکت و متن رو انتخاب کن، بقیه رو به ما بسپار.
              </p>

              <div className={`flex items-center gap-4 mt-8 transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <Link href="/letters" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                  شروع سفارش <ArrowRight size={16} />
                </Link>
                <Link href="/support" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-300 hover:text-white hover:bg-white/[0.06] font-medium text-sm transition-all duration-300">
                  پشتیبانی <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            <div className={`flex justify-center order-1 lg:order-2 transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
              <div className="relative w-full max-w-[440px] rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-b from-gray-800/20 to-gray-900/20 shadow-2xl shadow-blue-500/5 group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img src="/images/bluziperld-mailbox.png" alt="BluZiperld Mailbox" className="relative w-full h-auto object-cover rounded-3xl transition-all duration-700 group-hover:scale-105" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="relative py-16 md:py-20">
        <FloatingParticles />
        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
              <Heart size={20} className="text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black">
              ارزش‌هایی که باعث میشن
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">عاشق کارمون باشی</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, idx) => (
              <div key={item.title} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:border-blue-500/20 hover:bg-white/[0.04] hover:-translate-y-1 transition-all duration-500 text-right">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <item.icon size={24} className={item.color} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
              <Zap size={20} className="text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black">چجوری کار می‌کنیم؟</h2>
            <p className="text-gray-400 mt-2">خیلی ساده — فقط چهار قدم</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={step.n} className="group relative p-6 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-500 text-right">
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  {step.n}
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 mt-2 group-hover:scale-110 transition-transform">
                  <step.icon size={20} className="text-blue-400" />
                </div>
                <h3 className="font-bold mb-2 group-hover:text-blue-300 transition-colors">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-7">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST ============ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
              <Shield size={20} className="text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black">چطور به ما اعتماد کنید؟</h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-400">کاملاً طبیعیه که قبل از ثبت سفارش بخوای مطمئن شی. این چند نکته خیالت رو راحت می‌کنه.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trust.map((item, idx) => (
              <div key={item.title} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-500 text-right">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon size={20} className="text-blue-400" />
                </div>
                <h3 className="font-bold mb-2 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-7">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 md:p-10 rounded-3xl bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-violet-600/5 border border-blue-500/10 text-center hover:border-blue-500/20 transition-all">
            <p className="text-gray-400 max-w-2xl mx-auto">اگر هنوز شک داری، یه نگاه به پایین سایت بندازی — اونجا نماد اعتماد و زرین‌پال رو می‌بینی.</p>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
              <MessageCircleIcon size={20} className="text-blue-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black">سوالایی که شاید جوابشون رو بخوای</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-blue-500/10 transition-all duration-300">
                <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
                  <span className="font-bold text-sm md:text-base text-right group-hover:text-blue-300 transition-colors">{faq.q}</span>
                  <ChevronRight size={16} className="text-gray-500 group-open:rotate-90 transition-transform duration-300 shrink-0 mr-3" />
                </summary>
                <div className="px-5 pb-5"><p className="text-sm text-gray-400 leading-7">{faq.a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden border border-blue-500/10 bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-violet-600/10 text-center group hover:border-blue-500/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-cyan-500/8 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                <Send size={28} className="text-blue-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-4">آماده‌ای یه نامه واقعی بسازی؟</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">فقط پاکت و متن رو انتخاب کن، بقیه‌ش رو بسپر دست ما.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/letters" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-blue-500/25">
                  شروع سفارش <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-gradient-shift { animation: gradient-shift 4s ease infinite; }
        .animate-float-particle { animation: float-particle 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

const MessageCircleIcon = ({ size, className }: { size: number; className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);