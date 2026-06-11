"use client"

import { ShoppingCart, Eye, Star, Check, Heart, Zap } from "lucide-react"
import { useRef, useState, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

/* ==================== TYPES ==================== */
interface Product {
  _id?: string
  id?: string
  slug?: string
  title: string
  price: number
  discount?: number
  priceAfterDiscount?: number
  instock: number
  category?: string
  image?: string
  images?: string[]
  ratingAverage?: number
  rating?: number
}

interface ProductCardProps {
  product: Product
  mode?: "products" | "letters"
}

/* ==================== HELPERS ==================== */
const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000")

const buildImageUrl = (product: Product): string => {
  const apiBase = getApiBase()
  const rawImage = product.image ?? product.images?.[0] ?? ""

  if (!rawImage) return "/placeholder.png"
  if (rawImage.startsWith("http")) return rawImage
  if (rawImage.startsWith("/uploads")) return `${apiBase}${rawImage}`
  if (rawImage.includes("uploads")) return `${apiBase}/${rawImage.replace(/^\//, "")}`
  if (rawImage.startsWith("/")) return rawImage
  return `${apiBase}/uploads/${rawImage}`
}

const calculateFinalPrice = (product: Product): number => {
  if (product.priceAfterDiscount) return product.priceAfterDiscount
  if (product.discount && product.discount > 0) {
    return product.price * (1 - product.discount / 100)
  }
  return product.price
}

const getRating = (product: Product): number =>
  product.ratingAverage ?? product.rating ?? 0

/* ==================== CONSTANTS ==================== */
const STAR_COUNT = 5
const TOAST_DURATION = 2000

/* ==================== COMPONENT ==================== */
const ProductCard = memo(function ProductCard({
  product,
  mode = "products",
}: ProductCardProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const [toast, setToast] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const id = product._id || product.id || ""
  const detailsUrl =
    mode === "letters"
      ? `/letters/${product.slug || id}`
      : `/products/${product.slug || id}`
  const finalImageUrl = imgError ? "/placeholder.png" : buildImageUrl(product)
  const finalPrice = calculateFinalPrice(product)
  const rating = getRating(product)
  const isInStock = product.instock > 0

  const stockLabel = !isInStock
    ? "ناموجود"
    : product.instock <= 5
    ? `فقط ${product.instock} عدد`
    : "موجود"

  const stockColor = !isInStock
    ? "bg-red-500/20 text-red-300 border-red-500/30"
    : product.instock <= 5
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"

  // ==================== LIKE LOGIC ====================
  useEffect(() => {
    try {
      const likedItems = JSON.parse(localStorage.getItem("likedProducts") || "[]")
      setIsLiked(likedItems.includes(id))
    } catch {
      setIsLiked(false)
    }
  }, [id])

  const toggleLike = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        const likedItems = JSON.parse(localStorage.getItem("likedProducts") || "[]")
        let updated: string[]

        if (likedItems.includes(id)) {
          updated = likedItems.filter((item: string) => item !== id)
        } else {
          updated = [...likedItems, id]
        }

        localStorage.setItem("likedProducts", JSON.stringify(updated))
        setIsLiked(!isLiked)
        window.dispatchEvent(new Event("liked-updated"))
      } catch {
        // Silent fallback
      }
    },
    [id, isLiked]
  )

  // ==================== IMAGE HANDLERS ====================
  const handleImageLoad = useCallback(() => setImgLoaded(true), [])
  const handleImageError = useCallback(() => {
    if (!imgError) setImgError(true)
  }, [imgError])

  // ==================== MOUSE TRACKING ====================
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  // ==================== CART LOGIC ====================
  const handleAddToCart = useCallback(() => {
    if (!isInStock) return

    if (mode === "letters") {
      window.location.href = detailsUrl
      return
    }

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existing = cart.find((item: any) => item.productId === id)

      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1
      } else {
        cart.push({
          productId: id,
          title: product.title,
          price: finalPrice,
          image: finalImageUrl,
          quantity: 1,
          productType: mode === "letters" ? "letter" : "product",
          instock: product.instock,
        })
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      window.dispatchEvent(new Event("cart-updated"))

      setToast(true)
      setTimeout(() => setToast(false), TOAST_DURATION)
    } catch {
      // Fallback
    }
  }, [isInStock, mode, detailsUrl, id, product.title, finalPrice, finalImageUrl, product.instock])

  // ==================== RENDER ====================
  return (
    <>
      {/* ============ TOAST ============ */}
      <div
        className={`fixed top-6 right-6 z-[100] transition-all duration-500 ease-out ${
          toast
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 text-white px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/95 to-teal-600/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-emerald-500/25">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check size={16} className="text-white" strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[13px] truncate">به سبد اضافه شد!</p>
            <p className="text-[11px] text-white/70 truncate">{product.title}</p>
          </div>
        </div>
      </div>

      {/* ============ CARD ============ */}
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="group relative w-full rounded-3xl overflow-hidden transition-all duration-500"
        style={{
          background: "rgba(15, 18, 30, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: isHovered
            ? "0 30px 60px -20px rgba(27,108,255,0.35), 0 0 0 1px rgba(27,108,255,0.15) inset, 0 0 80px -30px rgba(27,108,255,0.25)"
            : "0 10px 30px -15px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset",
          transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        }}
      >
        {/* Glow دنبال موس */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(27,108,255,0.12), transparent 50%)`,
          }}
        />

        {/* ============ IMAGE SECTION ============ */}
        <Link
          href={detailsUrl}
          className="block relative overflow-hidden"
          aria-label={`مشاهده جزئیات ${product.title}`}
        >
          <div className="relative h-[200px] xs:h-[220px] sm:h-[240px] md:h-[220px] lg:h-[260px] xl:h-[280px] overflow-hidden bg-gradient-to-b from-gray-900/30 to-gray-900/10">
            {/* Skeleton */}
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 bg-gray-800/40 animate-pulse" />
            )}

            {/* Image */}
            <img
              ref={imgRef}
              src={finalImageUrl}
              alt={product.title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-700 select-none ${
                isHovered ? "scale-110 rotate-1" : "scale-100 rotate-0"
              } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f121e]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* ============ BADGES ============ */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
              {product.discount > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-black shadow-lg shadow-rose-500/30">
                  <Zap size={12} className="text-yellow-300" />
                  <span>%{product.discount}</span>
                </div>
              )}

              <div className={`ml-auto px-2.5 py-1.5 rounded-xl text-[10px] font-bold backdrop-blur-md border ${stockColor}`}>
                {stockLabel}
              </div>
            </div>

            {/* Wishlist */}
            <button
              onClick={toggleLike}
              className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 z-10 ${
                isLiked
                  ? "bg-rose-500/30 border-rose-500/50 text-rose-400 scale-110"
                  : "bg-black/30 border-white/10 text-white/60 hover:text-white hover:border-white/30"
              }`}
              aria-label={isLiked ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
            >
              <Heart
                size={15}
                className={`transition-all duration-300 ${isLiked ? "fill-rose-400" : ""}`}
                strokeWidth={2}
              />
            </button>
          </div>
        </Link>

        {/* ============ CONTENT ============ */}
        <div className="p-4 md:p-5 pb-14 md:pb-5 flex flex-col gap-3 relative">
          {/* Category */}
          {product.category && (
            <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">
              {product.category}
            </span>
          )}

          {/* Title */}
          <Link href={detailsUrl}>
            <h3 className="text-sm md:text-[15px] font-bold text-white leading-6 line-clamp-2 min-h-[44px] md:min-h-[48px] group-hover:text-blue-300 transition-colors duration-300">
              {product.title}
            </h3>
          </Link>

          {/* Rating only - no sales */}
          <div className="flex items-center">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: STAR_COUNT }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={`transition-all duration-300 ${
                    i < Math.floor(rating)
                      ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                      : i < rating
                      ? "text-amber-400/50 fill-amber-400/50"
                      : "text-gray-600"
                  }`}
                />
              ))}
              {rating > 0 && (
                <span className="text-[11px] text-amber-400/80 font-bold ml-1">
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Price only - no visits */}
          <div className="flex items-end mt-1">
            <div className="flex flex-col">
              {product.discount > 0 && (
                <span className="text-gray-500 text-[10px] md:text-[11px] line-through leading-tight">
                  {Number(product.price).toLocaleString()}
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-white text-lg md:text-xl lg:text-2xl font-black tracking-tight">
                  {Number(finalPrice).toLocaleString()}
                </span>
                <span className="text-gray-400 text-[10px] md:text-[11px] font-medium">تومان</span>
              </div>
            </div>
          </div>

          {/* ============ DESKTOP ACTIONS ============ */}
          <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-all duration-500 gap-2 mt-1 translate-y-2 group-hover:translate-y-0">
            {mode === "letters" ? (
              <Link
                href={detailsUrl}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <Zap size={15} className="text-yellow-300" />
                سفارش نامه
              </Link>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg ${
                  isInStock
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart size={15} />
                {isInStock ? "افزودن به سبد" : "ناموجود"}
              </button>
            )}

            <Link
              href={detailsUrl}
              className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold rounded-2xl border border-white/15 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              <Eye size={15} />
              مشاهده
            </Link>
          </div>

          {/* ============ MOBILE ADD BUTTON - Bottom LEFT ============ */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart()
            }}
            disabled={!isInStock}
            className={`md:hidden absolute bottom-4 left-4 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 active:scale-90 z-20 ${
              isInStock
                ? "bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-400/30 text-white shadow-lg shadow-blue-500/40"
                : "bg-gray-700/60 border-gray-500/20 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="افزودن به سبد خرید"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  )
})

export default ProductCard