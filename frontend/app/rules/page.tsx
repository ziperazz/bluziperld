"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import {
  BookOpen, Shield, User, Package, PenTool, CreditCard,
  Truck, RotateCcw, Lock, Copyright, ChevronLeft,
  MessageCircle, ArrowRight, Scale, FileText,
  HelpCircle, Mail, Clock, Sparkles, Star
} from "lucide-react"

const sections = [
  { id: "intro", title: "مقدمه", icon: BookOpen },
  { id: "account", title: "حساب کاربری", icon: User },
  { id: "orders", title: "ثبت سفارش", icon: Package },
  { id: "letters", title: "متن نامه‌ها", icon: PenTool },
  { id: "payment", title: "پرداخت", icon: CreditCard },
  { id: "shipping", title: "ارسال", icon: Truck },
  { id: "returns", title: "مرجوعی و استرداد", icon: RotateCcw },
  { id: "privacy", title: "حریم خصوصی", icon: Lock },
  { id: "intellectual", title: "مالکیت معنوی", icon: Copyright },
]

const content: Record<string, string[]> = {
  intro: [
    "به BluZiperld خوش آمدید — جایی که کلمات، بال درمی‌آورند و نامه‌های شما، سفیر احساساتتان می‌شوند.",
    "استفاده از خدمات این وب‌سایت به منزله پذیرش کامل قوانین و مقررات زیر است.",
    "ما این قوانین را به زبان ساده نوشته‌ایم: با صداقت رفتار کنید، اطلاعات درست بدهید، و بگذارید ما هم کارمان را به بهترین شکل انجام دهیم."
  ],
  account: [
    "برای استفاده از تمام امکانات BluZiperld، داشتن یک حساب کاربری لازم است.",
    "هنگام ثبت‌نام، اطلاعات واقعی و دقیق وارد کنید. ایمیل و شماره تماس را جدی بگیرید.",
    "حساب کاربری خود را با کسی به اشتراک نگذارید. هر اتفاقی که از طریق حساب شما بیفتد، مسئولیتش با خودتان است."
  ],
  orders: [
    "ثبت سفارش در سایت یعنی شما رسماً دست به کار شده‌اید و ما موظفیم تمام توانمان را برای تحقق خواسته‌تان به کار بگیریم.",
    "پس از ثبت سفارش، تیم ما اطلاعات را بررسی می‌کند تا مطمئن شویم همه چیز درست است.",
    "اگر ابهامی وجود داشته باشد، کارشناسان ما با شما تماس می‌گیرند. نگران نباشید، تماس ما صرفاً برای هماهنگی است.",
    "سفارش شما پس از تأیید نهایی وارد چرخه پردازش می‌شود."
  ],
  letters: [
    "متن نامه شما، قلب تپنده سفارشتان است.",
    "هر متنی که می‌نویسید، پیش از پردازش نهایی توسط تیم ما بازبینی می‌شود.",
    "محتوای شامل تهدید، خشونت یا توهین تأیید نخواهد شد. اما غیر از این، هر متنی قابل قبول است.",
    "ما به حریم خصوصی شما احترام می‌گذاریم. ادمین فقط متن را می‌بیند و نمی‌داند از سوی چه کسی است."
  ],
  payment: [
    "پرداخت در BluZiperld از طریق درگاه‌های امن و معتبر انجام می‌شود.",
    "اطلاعات کارت بانکی شما هرگز روی سرورهای ما ذخیره نمی‌شود.",
    "پس از پرداخت موفق، سفارش شما وارد مرحله پردازش می‌شود.",
    "اگر پرداخت ناموفق بود، مبلغ طبق قوانین بانکی به حساب شما بازمی‌گردد."
  ],
  shipping: [
    "ارسال سفارش‌ها از طریق روش‌های معتبر و قابل پیگیری انجام می‌شود.",
    "زمان تحویل بسته به مقصد شما متفاوت است.",
    "پس از ارسال، کد رهگیری برایتان ارسال می‌شود.",
    "هزینه ارسال بر اساس وزن، ابعاد و مقصد محاسبه می‌شود."
  ],
  returns: [
    "اگر از سفارش خود راضی نبودید، گوشمان برای شنیدن صدای شما باز است.",
    "هرگونه درخواست مرجوعی یا استرداد وجه از طریق تیم پشتیبانی قابل پیگیری است.",
    "هدف ما ساختن یک تجربه فوق‌العاده برای شماست."
  ],
  privacy: [
    "حریم خصوصی شما برای ما بسیار مهم است.",
    "اطلاعات شخصی شما فقط برای ارائه خدمات سایت استفاده می‌شود.",
    "داده‌های شما با استانداردهای امنیتی پیشرفته محافظت می‌شوند.",
    "شما حق دارید هر زمان که خواستید، اطلاعات حساب خود را ویرایش یا حذف کنید."
  ],
  intellectual: [
    "تمام محتوای این وب‌سایت حاصل کار تیم BluZiperld است.",
    "لطفاً بدون اجازه از محتوای ما استفاده نکنید.",
    "هرگونه کپی‌برداری بدون مجوز می‌تواند پیگرد قانونی داشته باشد."
  ]
}

/* ==================== PARTICLES - فقط توی Hero ==================== */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    {Array.from({ length: 8 }).map((_, i) => {
      const icons = [Sparkles, Star]
      const Icon = icons[i % 2]
      return (
        <div key={i} className="absolute animate-float"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
            opacity: 0.12 + Math.random() * 0.12,
          }}>
          <Icon size={6 + Math.random() * 6} className="text-blue-400/40" />
        </div>
      )
    })}
  </div>
)

export default function TermsPage() {
  const [active, setActive] = useState("intro")
  const [mounted, setMounted] = useState(false)
  const [sidebarPos, setSidebarPos] = useState({ position: "relative" as const, top: 0 })
  const [heroVisible, setHeroVisible] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sidebarParentRef = useRef<HTMLDivElement>(null)
  const lastSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setHeroVisible(true), 100)
  }, [])

  const updateSidebar = useCallback(() => {
    const sidebar = sidebarRef.current
    const parent = sidebarParentRef.current
    const lastSection = lastSectionRef.current
    if (!sidebar || !parent || !lastSection) return

    const parentRect = parent.getBoundingClientRect()
    const lastSectionRect = lastSection.getBoundingClientRect()
    const sidebarHeight = sidebar.offsetHeight
    const viewportHeight = window.innerHeight
    const scrollY = window.scrollY

    const parentTop = parentRect.top + scrollY
    const lastSectionBottom = lastSectionRect.bottom + scrollY

    if (scrollY > parentTop - 100) {
      if (scrollY + viewportHeight > lastSectionBottom + 50) {
        setSidebarPos({ position: "absolute", top: lastSectionBottom - parentTop - sidebarHeight })
      } else {
        setSidebarPos({ position: "fixed", top: 100 })
      }
    } else {
      setSidebarPos({ position: "relative", top: 0 })
    }
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", updateSidebar, { passive: true })
    window.addEventListener("resize", updateSidebar)
    updateSidebar()
    return () => {
      window.removeEventListener("scroll", updateSidebar)
      window.removeEventListener("resize", updateSidebar)
    }
  }, [updateSidebar])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id)
        if (el && el.offsetTop <= scrollPosition) {
          setActive(sections[i].id)
          break
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  const glassBg = { background: "rgba(10,15,28,0.5)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }
  const glassBorder = "border-[#1a2540]"

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* ============ HERO ============ */}
      <div className="relative py-24 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[150px] transition-all duration-[2000ms] ${heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
          <div className={`absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px] transition-all duration-[2000ms] delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`} />
        </div>

        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* ذرات فقط توی Hero */}
        <FloatingParticles />

        <div className="relative">
          <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 shadow-2xl shadow-blue-500/10 mb-8 transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0 rotate-0" : "opacity-0 translate-y-8 rotate-6"}`}>
            <Scale size={36} className="text-blue-400 md:w-10 md:h-10" strokeWidth={1.5} />
          </div>

          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black tracking-tight transition-all duration-1000 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
              قوانین و مقررات
            </span>
          </h1>

          <p className={`mt-5 md:mt-6 text-gray-400 max-w-2xl mx-auto text-sm md:text-lg leading-relaxed transition-all duration-1000 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            شفافیت، صداقت و احترام — سه ستونی که BluZiperld روی آن‌ها بنا شده است.
            <br />
            لطفاً پیش از استفاده از خدمات ما، این صفحه را مطالعه فرمایید.
          </p>

          <div className={`mt-8 flex items-center justify-center gap-3 transition-all duration-1000 delay-500 ${heroVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-blue-500/50 rounded-full" />
            <Star size={14} className="text-blue-400/60 animate-pulse" />
            <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-blue-500/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          
          <aside ref={sidebarParentRef} className="hidden lg:block lg:col-span-1 relative">
            <div ref={sidebarRef} className="w-full max-w-[260px] transition-all duration-300"
              style={{ position: sidebarPos.position, top: sidebarPos.top, width: "260px" }}>
              <div className={`p-5 rounded-2xl border ${glassBorder} backdrop-blur-xl`} style={glassBg}>
                <div className="flex items-center gap-2 mb-5">
                  <FileText size={14} className="text-blue-400" />
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">فهرست مطالب</h3>
                </div>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    const isActive = active === section.id
                    return (
                      <button key={section.id} onClick={() => scrollToSection(section.id)}
                        className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 group ${
                          isActive
                            ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/5"
                            : `text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent`
                        }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${isActive ? "bg-blue-500/20 scale-110" : "bg-white/[0.03] group-hover:bg-white/[0.06] group-hover:scale-105"}`}>
                          <Icon size={14} className={isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"} />
                        </div>
                        <span className="text-sm font-medium transition-all duration-300">{section.title}</span>
                        {isActive && <ChevronLeft size={12} className="text-blue-400 shrink-0 animate-slide-left" />}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            <div className="lg:hidden sticky top-20 z-30">
              <select value={active} onChange={(e) => scrollToSection(e.target.value)}
                className={`w-full bg-[#0a0f1c]/95 backdrop-blur-xl border ${glassBorder} rounded-2xl p-4 text-sm text-gray-300 focus:border-blue-500/30 outline-none transition-all shadow-2xl`}>
                {sections.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0a0f1c]">{s.title}</option>
                ))}
              </select>
            </div>

            {sections.map((section, index) => {
              const Icon = section.icon
              const isLast = section.id === "intellectual"
              const isActive = active === section.id
              return (
                <section key={section.id} id={section.id} ref={isLast ? lastSectionRef : undefined}
                  className={`scroll-mt-28 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${index * 80}ms` }}>
                  <div className={`group p-6 md:p-8 rounded-3xl border transition-all duration-500 ${
                    isActive
                      ? `bg-white/[0.03] border-blue-500/20 shadow-2xl shadow-blue-500/5`
                      : `bg-white/[0.01] border-[#1a2540] hover:border-[#253050] hover:bg-white/[0.02]`
                  }`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isActive
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-110"
                          : "bg-[#0a0f1c] group-hover:bg-[#0a0f1c]/80 group-hover:scale-105"
                      }`}>
                        <Icon size={22} className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h2 className={`text-xl md:text-2xl font-black transition-colors duration-500 ${isActive ? "text-white" : "text-gray-200 group-hover:text-white"}`}>
                          {section.title}
                        </h2>
                      </div>
                    </div>
                    <div className="space-y-4 text-sm md:text-base leading-8 text-gray-400">
                      {content[section.id].map((text, i) => (
                        <p key={i} className="transition-colors duration-300 hover:text-gray-300">{text}</p>
                      ))}
                    </div>
                  </div>
                </section>
              )
            })}

            {/* CTA */}
            <div className={`relative p-8 md:p-12 rounded-3xl overflow-hidden border border-blue-500/10 bg-gradient-to-br from-blue-600/10 via-cyan-600/5 to-violet-600/10 text-center group hover:border-blue-500/20 transition-all duration-500`}>
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-cyan-500/8 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700" />
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <HelpCircle size={28} className="text-blue-400" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">هنوز سوالی داری؟</h3>
                <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
                  تیم پشتیبانی BluZiperld همیشه آماده شنیدن صدای شماست.
                </p>
                
                <Link href="/support"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-xl shadow-blue-500/20">
                  <MessageCircle size={18} /> تماس با پشتیبانی <ArrowRight size={16} />
                </Link>
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 pt-6 border-t border-[#1a2540]">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={13} className="text-blue-400/70" /> support@bluziperld.ir
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={13} className="text-blue-400/70" /> پاسخگویی: ۹ صبح تا ۹ شب
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-600">BluZiperld © 2026</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes slide-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        .animate-gradient-shift { animation: gradient-shift 4s ease infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-left { animation: slide-left 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}