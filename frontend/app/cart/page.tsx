"use client";

import { useState, useEffect } from "react"
import {
  Trash2, Plus, Minus, ChevronRight,
  ShoppingCart, Truck, CreditCard, CheckCircle2,
  Tag, Gift, AlertCircle, X, ArrowLeft, Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

/* ==================== HELPERS ==================== */
const isValidToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    if (!payload) return false
    if (payload.exp) {
      const now = Date.now() / 1000
      if (payload.exp < now) return false
    }
    return true
  } catch { return false }
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [discountInput, setDiscountInput] = useState("")
  const [discount, setDiscount] = useState(0)
  const [discountError, setDiscountError] = useState("")
  const [discountSuccess, setDiscountSuccess] = useState("")
  const [discountInfo, setDiscountInfo] = useState<{ type: string; value: number; label: string } | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("")

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "error" | "success" }>({
    show: false, message: "", type: "error"
  })

  useEffect(() => setMounted(true), [])

  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "error" }), 4000)
  }

  const loadCart = () => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]")
    setItems(saved)
    setLoading(false)
  }

  useEffect(() => {
    loadCart()
    const handler = () => loadCart()
    window.addEventListener("cart-updated", handler)
    return () => window.removeEventListener("cart-updated", handler)
  }, [])

  const handleCheckout = () => {
    if (items.length === 0) return

    const hasLetter = items.some(i => i.productType === "letter")
    const hasProduct = items.some(i => i.productType !== "letter")

    if (hasLetter && hasProduct) {
      showToast("پاکت نامه و محصولات باید جداگانه سفارش داده بشن!", "error")
      return
    }

    const token = localStorage.getItem("accessToken")
    if (!token || !isValidToken(token)) {
      localStorage.removeItem("accessToken")
      router.push("/auth")
      return
    }

    // ذخیره تخفیف برای استفاده در صفحه shipping
    if (appliedDiscountCode) {
      sessionStorage.setItem("discountCode", appliedDiscountCode);
      sessionStorage.setItem("discountAmount", String(discount));
    }

    router.push("/shipping")
  }

  const updateQty = (productId: string, delta: number, currentQty: number) => {
    const newQty = Math.max(1, currentQty + delta)
    const updated = items.map(i => i.productId === productId ? { ...i, quantity: newQty } : i)
    setItems(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
    
    // اگه کد تخفیف اعمال شده، دوباره محاسبه کن
    if (appliedDiscountCode) {
      setDiscountInput(appliedDiscountCode);
      setDiscount(0);
      setDiscountInfo(null);
      setDiscountSuccess("");
      setAppliedDiscountCode("");
    }
  }

  const removeItem = (productId: string) => {
    const updated = items.filter(i => i.productId !== productId)
    setItems(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
    showToast("آیتم از سبد خرید حذف شد.", "success")
    
    // اگه کد تخفیف اعمال شده، دوباره محاسبه کن
    if (appliedDiscountCode) {
      setDiscountInput(appliedDiscountCode);
      setDiscount(0);
      setDiscountInfo(null);
      setDiscountSuccess("");
      setAppliedDiscountCode("");
    }
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const applyDiscount = async () => {
    const code = discountInput.trim().toUpperCase()
    setDiscountError("")
    setDiscountSuccess("")

    if (!code) {
      setDiscountError("کد تخفیف رو بنویس!")
      return
    }

    setDiscountLoading(true)
    try {
      const res = await fetch(`${API}/api/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderAmount: subtotal })
      })

      const data = await res.json()

      if (!res.ok) {
        setDiscountError(data.message || "کد تخفیف معتبر نیست")
        setDiscount(0)
        setDiscountInfo(null)
        setAppliedDiscountCode("")
        return
      }

      setDiscountInfo({
        type: data.discount.type,
        value: data.discount.value,
        label: data.discount.description || `کد ${data.discount.code}`
      })
      setDiscount(data.discount.discountAmount)
      setAppliedDiscountCode(data.discount.code)
      setDiscountSuccess(`${data.discount.discountAmount.toLocaleString()} تومان تخفیف اعمال شد! 🎉`)
    } catch (err) {
      setDiscountError("خطا در ارتباط با سرور")
    } finally {
      setDiscountLoading(false)
    }
  }

  const clearDiscount = () => {
    setDiscountInput("")
    setDiscount(0)
    setDiscountInfo(null)
    setDiscountError("")
    setDiscountSuccess("")
    setAppliedDiscountCode("")
  }

  const finalPrice = Math.max(0, subtotal - discount)

  const glassBg = { background: "rgba(10,15,28,0.55)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }
  const glassBorder = "border-[#1a2540]"
  const accentBg = "bg-blue-600"
  const accentGradient = "from-blue-600 to-blue-500"
  const accentHover = "hover:from-blue-500 hover:to-blue-400"
  const accentShadow = "shadow-blue-500/20"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">در حال بارگذاری سبد خرید...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-4 md:px-8 py-8 md:py-10 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className={`px-5 py-3 rounded-2xl border text-sm text-white shadow-2xl flex items-center gap-3 ${
            toast.type === "success" ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"
          }`} style={{ backdropFilter: "blur(20px)" }}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
            <span>{toast.message}</span>
            <button onClick={() => setToast({ show: false, message: "", type: "error" })} className="text-gray-500 hover:text-white ml-2">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-center mb-10 gap-2 md:gap-3">
          <StepItem icon={<ShoppingCart size={16} />} label="بررسی سبد" active />
          <StepLine />
          <StepItem icon={<Truck size={16} />} label="اطلاعات ارسال" />
          <StepLine />
          <StepItem icon={<CreditCard size={16} />} label="پرداخت" />
          <StepLine />
          <StepItem icon={<CheckCircle2 size={16} />} label="پایان" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                سبد خرید
                {items.length > 0 && <span className="text-sm font-normal text-gray-500">({items.length} آیتم)</span>}
              </h2>
              {items.length > 0 && (
                <button onClick={() => { setItems([]); localStorage.removeItem("cart"); window.dispatchEvent(new Event("cart-updated")); clearDiscount(); showToast("سبد خرید خالی شد!", "success") }}
                  className="text-[10px] text-gray-500 hover:text-red-400 transition-colors">
                  خالی کردن سبد
                </button>
              )}
            </div>

            {items.length === 0 && (
              <div className={`text-center py-16 rounded-3xl border ${glassBorder}`} style={glassBg}>
                <ShoppingCart size={40} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 text-sm mb-4">سبد خرید شما خالی است!</p>
                <p className="text-gray-600 text-xs mb-6">هنوز چیزی انتخاب نکردی؟ برو یه گشتی بزن.</p>
                <Link href="/letters"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${accentGradient} ${accentHover} text-white text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg ${accentShadow}`}>
                  مشاهده محصولات <ArrowLeft size={16} />
                </Link>
              </div>
            )}

            {items.map((item) => (
              <div key={item.productId}
                className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border ${glassBorder} hover:border-blue-500/20 transition-all duration-300`}
                style={glassBg}>
                
                <Link href={item.productType === "letter" ? `/letters/${item.productId}` : `/products/${item.productId}`}
                  className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#1a2540] hover:border-blue-500/30 transition-all">
                  <img src={item.image || "/images/letter1.jpg"} alt={item.title}
                    className="w-full h-full object-cover transition group-hover:scale-105" />
                </Link>

                <div className="flex-grow text-center sm:text-right min-w-0">
                  <Link href={item.productType === "letter" ? `/letters/${item.productId}` : `/products/${item.productId}`}
                    className="text-sm font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
                    {item.title || (item.productType === "letter" ? "پاکت نامه" : "محصول")}
                  </Link>

                  {item.productType === "letter" && item.letterText && (
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed break-words line-clamp-2">
                      متن: {item.letterText.slice(0, 60)}...
                    </p>
                  )}

                  {item.writingType && (
                    <span className="text-[10px] text-blue-400/60 mt-1 inline-block">
                      {item.writingType === "HAND" ? "دست‌نویس" : "چاپ"}
                    </span>
                  )}

                  <p className="text-blue-400 text-sm font-bold mt-1">
                    {(item.price * item.quantity).toLocaleString()} تومان
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#0a0f1c] px-3 py-2 rounded-xl border border-[#1a2540]">
                  <button onClick={() => updateQty(item.productId, 1, item.quantity)}
                    className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Plus size={15} />
                  </button>
                  <span className="text-sm w-6 text-center text-white font-bold">{item.quantity}</span>
                  {item.quantity > 1 ? (
                    <button onClick={() => updateQty(item.productId, -1, item.quantity)}
                      className="text-gray-400 hover:text-white transition-colors">
                      <Minus size={15} />
                    </button>
                  ) : (
                    <button onClick={() => removeItem(item.productId)}
                      className="text-red-400/70 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 p-5 rounded-2xl border ${glassBorder}`}
              style={{ background: "rgba(10,15,28,0.7)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }}>

              <h3 className="text-base font-bold mb-4 text-white border-b border-[#1a2540] pb-3 flex items-center gap-2">
                <Gift size={16} className="text-blue-400" /> خلاصه سفارش
              </h3>

              <div className="space-y-3 mb-6">
                <Row label="قیمت کالاها" value={`${subtotal.toLocaleString()} تومان`} />
                {discount > 0 && <Row label="تخفیف"><span className="text-emerald-400">-{discount.toLocaleString()} تومان</span></Row>}
                <Row label="هزینه ارسال"><span className="text-[10px] text-gray-500">وابسته به آدرس</span></Row>
                <div className="pt-3 border-t border-[#1a2540] flex justify-between items-center">
                  <span className="text-sm font-bold text-white">جمع کل</span>
                  <span className="text-lg font-black text-blue-400">
                    {finalPrice.toLocaleString()}
                    <span className="text-[10px] font-normal text-gray-500 mr-1">تومان</span>
                  </span>
                </div>
              </div>

              {/* Discount */}
              <div className="mb-5 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={10} /> کد تخفیف
                </label>
                <div className="flex gap-2">
                  <input value={discountInput} onChange={(e) => { setDiscountInput(e.target.value); setDiscountError(""); setDiscountSuccess(""); }}
                    placeholder="کد تخفیف را وارد کنید..."
                    disabled={discountLoading}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#0a0f1c] border border-[#1a2540] text-white placeholder:text-gray-600 focus:border-blue-500/30 outline-none transition-all disabled:opacity-50" />
                  {discountInfo ? (
                    <button onClick={clearDiscount}
                      className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all">
                      <X size={14} />
                    </button>
                  ) : (
                    <button onClick={applyDiscount} disabled={discountLoading}
                      className={`px-4 py-2 rounded-xl ${accentBg} hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1`}>
                      {discountLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                      اعمال
                    </button>
                  )}
                </div>
                {discountError && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} /> {discountError}</p>}
                {discountSuccess && <p className="text-[10px] text-emerald-400 flex items-center gap-1">✅ {discountSuccess}</p>}
              </div>

              <button onClick={handleCheckout} disabled={items.length === 0}
                className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${accentGradient} ${accentHover} text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg ${accentShadow} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}>
                ثبت و ادامه سفارش
                <ChevronRight size={17} className="rotate-180" />
              </button>

              <Link href="/products"
                className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl border border-[#1a2540] text-gray-400 hover:text-white text-xs font-medium transition-all">
                ← ادامه خرید
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-400 text-xs">{label}</span>
      {children ? children : <span className="text-gray-200 text-xs font-medium">{value}</span>}
    </div>
  )
}

function StepItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
        active ? "bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.45)]" :
        "bg-[#0a0f1c] text-gray-600 border border-[#1a2540]"
      }`}>
        {icon}
      </div>
      <span className={`text-[10px] md:text-[11px] whitespace-nowrap ${active ? "text-white font-bold" : "text-gray-600"}`}>{label}</span>
    </div>
  )
}

function StepLine() {
  return <div className="w-6 md:w-10 h-[2px] bg-[#1a2540] mb-5 rounded-full" />;
}