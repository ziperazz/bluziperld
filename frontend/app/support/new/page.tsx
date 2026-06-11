"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight, Loader2, MessageCircle, AlertCircle,
  Send, Sparkles, ChevronRight, Home, HeadphonesIcon,
  Flag, FileText, Zap, HelpCircle, Mail, Shield
} from "lucide-react"
import Link from "next/link"

/* ==================== PRIORITY BUTTON ==================== */
function PriorityButton({ label, value, desc, active, color, onClick }: {
  label: string
  value: string
  desc: string
  active: boolean
  color: "emerald" | "amber" | "red"
  onClick: () => void
}) {
  const colorMap = {
    emerald: {
      active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10",
      icon: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    amber: {
      active: "border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-lg shadow-amber-500/10",
      icon: "text-amber-400",
      dot: "bg-amber-400",
    },
    red: {
      active: "border-red-500/30 bg-red-500/10 text-red-300 shadow-lg shadow-red-500/10",
      icon: "text-red-400",
      dot: "bg-red-400",
    },
  }

  const colors = colorMap[color]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
        active
          ? colors.active + " scale-[1.03]"
          : "border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.15] hover:bg-white/[0.04]"
      }`}
    >
      {active && (
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
      )}
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[9px] opacity-60">{desc}</span>
    </button>
  )
}

/* ==================== MAIN COMPONENT ==================== */
export default function NewTicketPage() {
  const router = useRouter()

  const [subject, setSubject] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setCharCount(message.length)
  }, [message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim()) {
      setError("لطفاً موضوع تیکت را وارد کنید")
      return
    }
    if (!message.trim()) {
      setError("لطفاً توضیحات تیکت را وارد کنید")
      return
    }

    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("accessToken")
      if (!token) {
        setError("لطفاً ابتدا وارد حساب کاربری خود شوید")
        setLoading(false)
        return
      }

      const res = await fetch(`${API}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          subject: subject.trim(),
          priority,
          message: message.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || "خطا در ایجاد تیکت")
      }

      router.push("/support")
    } catch (err: any) {
      setError(err.message || "مشکلی پیش آمده")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* ============ BREADCRUMB ============ */}
        <nav className={`flex items-center gap-2 text-xs text-gray-500 mb-8 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <Home size={12} /> خانه
          </Link>
          <ChevronRight size={12} />
          <Link href="/support" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <HeadphonesIcon size={12} /> پشتیبانی
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-300">تیکت جدید</span>
        </nav>

        {/* ============ HEADER ============ */}
        <div className={`text-right mb-8 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold mb-4">
            <Sparkles size={12} />
            <span>ارتباط با پشتیبانی</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            ایجاد تیکت جدید
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
            لطفاً موضوع و توضیحات کامل را وارد کنید تا تیم پشتیبانی بتواند در سریع‌ترین زمان ممکن به شما رسیدگی کند.
          </p>
        </div>

        {/* ============ FORM CARD ============ */}
        <div className={`rounded-3xl border border-white/[0.06] overflow-hidden transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{
            background: "rgba(10, 15, 30, 0.6)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            boxShadow: "0 20px 50px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset",
          }}
        >
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-7">
            
            {/* ============ SUBJECT ============ */}
            <div className="space-y-2 text-right">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <FileText size={15} className="text-blue-400" />
                موضوع تیکت
              </label>
              <div className="relative">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: مشکل در پرداخت سفارش"
                  maxLength={100}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/30 focus:bg-white/[0.05] outline-none transition-all duration-300"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] text-gray-600">
                  {subject.length}/۱۰۰
                </span>
              </div>
            </div>

            {/* ============ PRIORITY ============ */}
            <div className="space-y-3 text-right">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <Flag size={15} className="text-blue-400" />
                میزان اهمیت
              </label>

              <div className="grid grid-cols-3 gap-3">
                <PriorityButton
                  label="کم"
                  value="LOW"
                  desc="معمولی"
                  active={priority === "LOW"}
                  color="emerald"
                  onClick={() => setPriority("LOW")}
                />
                <PriorityButton
                  label="متوسط"
                  value="MEDIUM"
                  desc="نیاز به پیگیری"
                  active={priority === "MEDIUM"}
                  color="amber"
                  onClick={() => setPriority("MEDIUM")}
                />
                <PriorityButton
                  label="زیاد"
                  value="HIGH"
                  desc="فوری"
                  active={priority === "HIGH"}
                  color="red"
                  onClick={() => setPriority("HIGH")}
                />
              </div>
            </div>

            {/* ============ MESSAGE ============ */}
            <div className="space-y-2 text-right">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <MessageCircle size={15} className="text-blue-400" />
                توضیحات کامل
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="توضیحات خود را با جزئیات کامل وارد کنید..."
                  rows={6}
                  maxLength={2000}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/30 focus:bg-white/[0.05] outline-none transition-all duration-300 resize-none leading-7"
                />
                <span className="absolute bottom-3 left-4 text-[9px] text-gray-600">
                  {charCount.toLocaleString()}/۲,۰۰۰
                </span>
              </div>
            </div>

            {/* ============ ERROR ============ */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-right">
                <AlertCircle size={18} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            {/* ============ SUBMIT ============ */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !subject.trim() || !message.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  subject.trim() && message.trim() && !loading
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95"
                    : "bg-white/[0.04] text-gray-600 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    در حال ارسال تیکت...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    ارسال تیکت
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ============ HINTS ============ */}
        <div className={`mt-8 grid sm:grid-cols-3 gap-4 transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {[
            { icon: Zap, title: "پاسخ سریع", desc: "معمولاً کمتر از ۱۲ ساعت" },
            { icon: Shield, title: "محفوظ و امن", desc: "مکالمات شما رمزنگاری می‌شود" },
            { icon: Mail, title: "اعلان ایمیلی", desc: "پاسخ‌ها را ایمیل می‌شوید" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <item.icon size={16} className="text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-300">{item.title}</p>
                <p className="text-[10px] text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}