"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Heart, ChevronLeft, ChevronRight, ShoppingCart,
  Check, PenTool, Printer, Star, Eye, Package,
  Info, Zap, Maximize2, Loader2, Sparkles
} from "lucide-react"
import Link from "next/link"
import CommentsSection from "@/components/CommentsSection"
import SeoFooter from "@/components/SeoFooter"
import RelatedProducts from "@/components/RelatedProducts"
import AiWritingHelper from "@/components/AiWritingHelper"

/* ==================== TYPES ==================== */
type Letter = {
  _id: string
  title: string
  price: number
  discount?: number
  priceAfterDiscount?: number
  instock?: number
  images?: string[]
  image?: string
  description?: string
  specs?: { label: string; value: string }[]
  handwritingExtraPrice?: number
  printingExtraPrice?: number
  purchaseCount?: number
  visits?: number
  ratingAverage?: number
  rating?: number
  category?: string
}

type WritingType = "HAND" | "PRINT"

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000"
const MAX_CHARS = 1500

/* ==================== COMPONENT ==================== */
export default function LetterDetailsPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [product, setProduct] = useState<Letter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeImage, setActiveImage] = useState(0)
  const [addLoading, setAddLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const [letterText, setLetterText] = useState("")
  const [writingType, setWritingType] = useState<WritingType>("HAND")
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("accessToken")
      if (t) setToken(t)
    }
  }, [])

  useEffect(() => {
    if (!product) return
    try {
      const likedItems = JSON.parse(localStorage.getItem("likedProducts") || "[]")
      setIsLiked(likedItems.includes(product._id))
    } catch { setIsLiked(false) }
  }, [product])

  useEffect(() => {
    if (!slug) return
    const fetchLetter = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/letters/slug/${slug}`)
        if (!res.ok) throw new Error("پاکت نامه یافت نشد")
        const data = await res.json()
        data.specs = Array.isArray(data.specs) ? data.specs : []
        data.images = Array.isArray(data.images) ? data.images : []
        setProduct(data)
      } catch (err) {
        console.error(err)
        setError("خطا در دریافت اطلاعات پاکت نامه")
      } finally { setLoading(false) }
    }
    fetchLetter()
  }, [slug])

  const fixImageUrl = useCallback((url?: string) => {
    if (!url) return "/placeholder.png"
    if (url.startsWith("http")) return url
    if (url.startsWith("/uploads")) return `${API_BASE}${url}`
    if (url.startsWith("uploads/")) return `${API_BASE}/${url}`
    return url
  }, [])

  const normalizedImages = useMemo(() => {
    if (!product) return []
    const imgs = product.images && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : []
    return imgs.map(fixImageUrl)
  }, [product, fixImageUrl])

  const mainImage = normalizedImages[activeImage] || "/placeholder.png"

  const basePrice = product
    ? (product.discount && product.discount > 0
        ? product.priceAfterDiscount || product.price * (1 - product.discount / 100)
        : product.price)
    : 0

  const handwritingExtra = product?.handwritingExtraPrice || 0
  const printingExtra = product?.printingExtraPrice || 0
  const writingPrice = writingType === "HAND" ? handwritingExtra : printingExtra
  const finalPrice = basePrice + writingPrice
  const isInStock = (product?.instock ?? 0) > 0

  const toggleLike = () => {
    if (!product) return
    try {
      const likedItems = JSON.parse(localStorage.getItem("likedProducts") || "[]")
      if (likedItems.includes(product._id)) {
        localStorage.setItem("likedProducts", JSON.stringify(likedItems.filter((id: string) => id !== product._id)))
        setIsLiked(false)
      } else {
        localStorage.setItem("likedProducts", JSON.stringify([...likedItems, product._id]))
        setIsLiked(true)
      }
    } catch {}
  }

  const addToCart = () => {
    if (!product || !isInStock) return
    if (!letterText.trim()) {
      alert("لطفاً متن نامه را وارد کنید.")
      return
    }
    setAddLoading(true)
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const newItem = {
        productId: product._id,
        title: product.title,
        price: finalPrice,
        basePrice,
        writingPrice,
        writingType,
        letterText,
        image: mainImage,
        quantity: 1,
        productType: "letter",
      }
      const existingIndex = cart.findIndex(
        (i: any) => i.productId === product._id && i.writingType === writingType && i.letterText === letterText
      )
      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1
      } else {
        cart.push(newItem)
      }
      localStorage.setItem("cart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cart-updated"))
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2500)
    } catch (err) { console.error("cart error", err) }
    setAddLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="text-blue-400 animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Info size={36} className="text-red-400 mx-auto" />
          <p className="text-red-400">{error || "پاکت نامه یافت نشد"}</p>
          <Link href="/letters" className="text-blue-400 text-sm">بازگشت</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      {/* Toast */}
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-500 ${showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          <Check size={16} className="text-white" strokeWidth={3} />
          <span className="text-sm font-bold">به سبد خرید اضافه شد!</span>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setShowFullImage(false)}>
          <button onClick={() => setShowFullImage(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <Maximize2 size={18} className="text-white rotate-45" />
          </button>
          <img src={mainImage} alt={product.title} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-400">خانه</Link>
          <ChevronLeft size={12} />
          <Link href="/letters" className="hover:text-blue-400">پاکت نامه‌ها</Link>
          <ChevronLeft size={12} />
          <span className="text-gray-300 truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* ============ LEFT COLUMN ============ */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-800/20 border border-white/[0.06] group cursor-pointer" onClick={() => setShowFullImage(true)}>
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-4">
                <span className="text-xs text-white/70">کلیک برای بزرگنمایی</span>
              </div>

              <div className="absolute top-4 left-4 flex gap-2">
                {product.discount && product.discount > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black shadow-lg">
                    <Zap size={12} className="text-yellow-300" /> %{product.discount}
                  </div>
                )}
              </div>

              <button onClick={(e) => { e.stopPropagation(); toggleLike() }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all z-10 ${
                  isLiked ? "bg-rose-500/30 border-rose-500/50 text-rose-400 scale-110" : "bg-black/30 border-white/10 text-white/60 hover:text-white hover:border-white/30"
                }`}>
                <Heart size={16} className={isLiked ? "fill-rose-400" : ""} strokeWidth={2} />
              </button>

              {normalizedImages.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage(p => p === 0 ? normalizedImages.length - 1 : p - 1) }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setActiveImage(p => p === normalizedImages.length - 1 ? 0 : p + 1) }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {normalizedImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {normalizedImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? "border-blue-500 shadow-lg shadow-blue-500/30 scale-105" : "border-white/[0.06] hover:border-blue-400/50 opacity-70 hover:opacity-100"
                    }`}>
                    <img src={img} alt={`${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* DESKTOP: توضیحات + مشخصات زیر عکس‌ها */}
            <div className="hidden lg:block space-y-4">
              {product.description && (
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                  <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Info size={14} className="text-blue-400" /> توضیحات</h3>
                  <p className="text-sm text-gray-400 leading-7">{product.description}</p>
                </div>
              )}

              {product.specs && product.specs.length > 0 && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <Package size={14} className="text-blue-400" /> مشخصات محصول
                  </h3>
                  <div className="space-y-2">
                    {product.specs.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-2 border-b border-white/[0.03] last:border-0">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-gray-200 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============ RIGHT COLUMN ============ */}
          <div className="space-y-5">
            {/* Category & Title */}
            <div>
              {product.category && <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">{product.category}</span>}
              <h1 className="text-2xl md:text-3xl font-black mt-1.5">{product.title}</h1>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={i <= (product.ratingAverage || product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-600"} />
              ))}
              <span className="text-gray-600">|</span>
              <Eye size={14} /> <span>{product.visits ?? 0}</span>
              <span className="text-gray-600">|</span>
              <ShoppingCart size={14} /> <span>{product.purchaseCount ?? 0} فروش</span>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">قیمت اصلی</span>
                <span className={product.discount && product.discount > 0 ? "text-gray-500 line-through" : "text-white font-bold"}>
                  {product.price.toLocaleString()} تومان
                </span>
              </div>

              {product.discount && product.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">تخفیف</span>
                  <span className="text-rose-400 font-bold">٪{product.discount}</span>
                </div>
              )}

              {product.discount && product.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">بعد از تخفیف</span>
                  <span className="text-emerald-400 font-bold">{basePrice.toLocaleString()} تومان</span>
                </div>
              )}

              {writingPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {writingType === "HAND" ? "هزینه دست‌نویس" : "هزینه چاپ"}
                  </span>
                  <span className="text-blue-400 font-bold">+{writingPrice.toLocaleString()} تومان</span>
                </div>
              )}

              <div className="border-t border-[#1a2540] pt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-white">قیمت نهایی</span>
                <span className="text-xl font-black text-blue-400">
                  {finalPrice.toLocaleString()}
                  <span className="text-[10px] font-normal text-gray-500 mr-1">تومان</span>
                </span>
              </div>

              <div className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold ${
                isInStock ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {isInStock ? `موجود (${product.instock} عدد)` : "ناموجود"}
              </div>
            </div>

            {/* Letter Writing Box */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-blue-500/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <PenTool size={14} className="text-blue-400" /> متن نامه
                </h3>
                <span className="text-[10px] text-gray-600">{letterText.length}/{MAX_CHARS}</span>
              </div>

              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((letterText.length / MAX_CHARS) * 100, 100)}%` }} />
              </div>

              <textarea
                value={letterText}
                maxLength={MAX_CHARS}
                onChange={(e) => setLetterText(e.target.value)}
                placeholder="متن نامه خود را اینجا بنویسید..."
                className="w-full min-h-[160px] resize-none bg-[#020617]/60 border border-white/[0.06] rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 leading-7 placeholder:text-gray-600 transition-all"
              />

              {/* 🆕 AI Helper + Counter */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-600">{letterText.length}/{MAX_CHARS} کاراکتر</span>
                <AiWritingHelper onResult={(text) => setLetterText(text)} category={product.category} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWritingType("HAND")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    writingType === "HAND"
                      ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10"
                      : "bg-[#020617]/40 border-white/[0.06] hover:border-white/[0.15]"
                  }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    writingType === "HAND" ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.04] text-gray-500"
                  }`}>
                    <PenTool size={22} />
                  </div>
                  <span className={`text-sm font-bold ${writingType === "HAND" ? "text-white" : "text-gray-400"}`}>دست‌نویس</span>
                  <span className="text-[10px] text-gray-500">کاغذ کرافت</span>
                  {handwritingExtra > 0 && (
                    <span className="text-[11px] font-bold text-blue-400">+{handwritingExtra.toLocaleString()} تومان</span>
                  )}
                </button>

                <button
                  onClick={() => setWritingType("PRINT")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    writingType === "PRINT"
                      ? "bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10"
                      : "bg-[#020617]/40 border-white/[0.06] hover:border-white/[0.15]"
                  }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    writingType === "PRINT" ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.04] text-gray-500"
                  }`}>
                    <Printer size={22} />
                  </div>
                  <span className={`text-sm font-bold ${writingType === "PRINT" ? "text-white" : "text-gray-400"}`}>چاپ</span>
                  <span className="text-[10px] text-gray-500">کاغذ معمولی</span>
                  {printingExtra > 0 && (
                    <span className="text-[11px] font-bold text-blue-400">+{printingExtra.toLocaleString()} تومان</span>
                  )}
                </button>
              </div>
            </div>

            {/* MOBILE: مشخصات بین متن نامه و توضیحات */}
            <div className="block lg:hidden space-y-4">
              {product.specs && product.specs.length > 0 && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                    <Package size={14} className="text-blue-400" /> مشخصات محصول
                  </h3>
                  <div className="space-y-2">
                    {product.specs.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-2 border-b border-white/[0.03] last:border-0">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-gray-200 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.description && (
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                  <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2"><Info size={14} className="text-blue-400" /> توضیحات</h3>
                  <p className="text-sm text-gray-400 leading-7">{product.description}</p>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={addToCart}
              disabled={addLoading || !isInStock}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                isInStock
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
              }`}>
              {addLoading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
              {isInStock ? `افزودن به سبد - ${finalPrice.toLocaleString()} تومان` : "ناموجود"}
            </button>
          </div>
        </div>

        {/* ============ RELATED LETTERS ============ */}
        <RelatedProducts excludeId={product._id} mode="letter" />

        {/* ============ COMMENTS ============ */}
        <div className="mt-16 pt-10 border-t border-white/[0.04]">
          <CommentsSection productId={product._id} token={token} targetType="letter" />
        </div>

        {/* ============ SEO FOOTER ============ */}
        <SeoFooter product={product} type="letter" />

        {/* ============ SCHEMA JSON-LD ============ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.title,
              description: product.description?.slice(0, 200) || product.title,
              image: normalizedImages[0] || "",
              sku: product._id,
              category: product.category || "پاکت نامه",
              offers: {
                "@type": "Offer",
                price: finalPrice,
                priceCurrency: "IRR",
                availability: isInStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                url: `https://bluziperld.ir/letters/${slug}`,
              },
              aggregateRating: product.ratingAverage
                ? {
                    "@type": "AggregateRating",
                    ratingValue: product.ratingAverage,
                    reviewCount: product.rating || 0,
                    bestRating: 5,
                    worstRating: 0,
                  }
                : undefined,
            }),
          }}
        />

        {/* ============ BREADCRUMB SCHEMA ============ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "خانه",
                  item: "https://bluziperld.ir",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "پاکت نامه‌ها",
                  item: "https://bluziperld.ir/letters",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.title,
                  item: `https://bluziperld.ir/letters/${slug}`,
                },
              ],
            }),
          }}
        />
      </div>
    </div>
  )
}