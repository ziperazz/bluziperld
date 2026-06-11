"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Heart, ChevronLeft, ChevronRight, ShoppingCart,
  Check, Star, Eye, Package, Info, Zap, Maximize2, Loader2
} from "lucide-react"
import Link from "next/link"
import CommentsSection from "@/components/CommentsSection"
import SeoFooter from "@/components/SeoFooter"
import RelatedProducts from "@/components/RelatedProducts"

/* ==================== TYPES ==================== */
type Product = {
  _id: string
  slug?: string
  title: string
  price: number
  discount?: number
  priceAfterDiscount?: number
  instock?: number
  images?: string[]
  image?: string
  description?: string
  specs?: { label: string; value: string }[]
  purchaseCount?: number
  visits?: number
  ratingAverage?: number
  rating?: number
  category?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000"

export default function ProductPage() {
  const params = useParams()
  const slug = params?.id as string | undefined

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [addLoading, setAddLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
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
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/products/${slug}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        data.specs = Array.isArray(data.specs) ? data.specs : []
        setProduct(data)
      } catch {
        setError(true)
      } finally { setLoading(false) }
    }
    fetchProduct()
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

  const finalPrice = product
    ? (product.discount && product.discount > 0
        ? product.priceAfterDiscount || product.price * (1 - product.discount / 100)
        : product.price)
    : 0

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
    setAddLoading(true)
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const newItem = {
        productId: product._id,
        productType: "product",
        title: product.title,
        price: finalPrice,
        image: mainImage,
        quantity: 1,
      }
      const existing = cart.find((i: any) => i.productId === product._id)
      if (existing) {
        existing.quantity += 1
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
          <p className="text-red-400">خطا در دریافت محصول</p>
          <Link href="/products" className="text-blue-400 text-sm">بازگشت</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-500 ${showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600/95 backdrop-blur-xl border border-white/20 shadow-2xl">
          <Check size={16} className="text-white" strokeWidth={3} />
          <span className="text-sm font-bold">به سبد خرید اضافه شد!</span>
        </div>
      </div>

      {showFullImage && (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setShowFullImage(false)}>
          <button onClick={() => setShowFullImage(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <Maximize2 size={18} className="text-white rotate-45" />
          </button>
          <img src={mainImage} alt={product.title} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-400">خانه</Link>
          <ChevronLeft size={12} />
          <Link href="/products" className="hover:text-blue-400">محصولات</Link>
          <ChevronLeft size={12} />
          <span className="text-gray-300 truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
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
          </div>

          <div className="space-y-5">
            <div>
              {product.category && <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">{product.category}</span>}
              <h1 className="text-2xl md:text-3xl font-black mt-1.5">{product.title}</h1>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={i <= (product.ratingAverage || product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-600"} />
              ))}
              <span className="text-gray-600">|</span>
              <Eye size={14} /> <span>{product.visits ?? 0}</span>
              <span className="text-gray-600">|</span>
              <ShoppingCart size={14} /> <span>{product.purchaseCount ?? 0} فروش</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              {product.discount && product.discount > 0 && (
                <span className="text-gray-500 text-sm line-through">{product.price.toLocaleString()} تومان</span>
              )}
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black">{finalPrice.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">تومان</span>
              </div>
              <div className={`inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold ${
                isInStock ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {isInStock ? `موجود (${product.instock} عدد)` : "ناموجود"}
              </div>
            </div>

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

        {/* 🆕 ============ RELATED PRODUCTS ============ */}
        <RelatedProducts excludeId={product._id} mode="product" />

        {/* ============ COMMENTS ============ */}
        <div className="mt-16 pt-10 border-t border-white/[0.04]">
          <CommentsSection productId={product._id} token={token} targetType="product" />
        </div>

        {/* 🆕 ============ SEO FOOTER ============ */}
        <SeoFooter product={product} type="product" />

        {/* 🆕 ============ SCHEMA JSON-LD ============ */}
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
              category: product.category || "محصول",
              offers: {
                "@type": "Offer",
                price: finalPrice,
                priceCurrency: "IRR",
                availability: isInStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                url: `https://bluziperld.ir/products/${slug}`,
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

        {/* 🆕 ============ BREADCRUMB SCHEMA ============ */}
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
                  name: "محصولات",
                  item: "https://bluziperld.ir/products",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.title,
                  item: `https://bluziperld.ir/products/${slug}`,
                },
              ],
            }),
          }}
        />
      </div>
    </div>
  )
}